import { pool } from "../config/database"
import { ChessEngine } from "../chess/engine/chess-engine";
import { GameState } from "../chess/models/game-state-model";
import { InitialPieces } from "../chess/data/initial-pieces";
import { Pool,PoolClient } from "pg";
import { create } from "node:domain";
import { error } from "node:console";


export function createGame(
    whitePlayerId: string,
    blackPlayerId: string,
    timeControl: string,
    increment: number,
    initialTime: number,
    database: Pool | PoolClient
)
{

    const initialGameState: GameState = {
        pieces: InitialPieces.map(piece => ({...piece})),
        turn: 'white',
        status: 'playing',
        lastMove: null
    }

    return database.query(
        `INSERT INTO games(
            white_player_id,
            black_player_id,
            time_control,
            increment,
            white_time,
            black_time,
            board_state,
            turn,
            status,
            last_move_at
        )
        VALUES($1, $2, $3, $4, $5, $5, $6, 'white', 'PLAYING', NOW())
        RETURNING * `,
        [
            whitePlayerId,
            blackPlayerId,
            timeControl,
            increment,
            initialTime,
            initialGameState,
        ]
    )
    .then(result => {
        return result.rows[0];
    });
}


export function getGameById(gameId: string){
    
    return pool.query(
        `SELECT * FROM games
        WHERE id = $1`,
        [gameId]
    )
    .then(result => {
        if(result.rows.length === 0){
            throw new Error('GAME_NOT_FOUND');
        }

        return result.rows[0];
    });
}

export function getActiveGamesByPlayer(playerId: string){
       
    return pool.query(
        `SELECT * FROM games
        WHERE (
            white_player_id = $1
            OR black_player_id = $1
        )
        AND status = 'PLAYING'
        ORDER BY updated_at DESC `,
        [playerId]
    )
    .then(result => {
        return result.rows;
    });
}

export function makeMove(
    gameId: string,
    playerId: string,
    from: string,
    to: string
) {
    return pool.query(
        `SELECT * FROM games
        WHERE id = $1`,
        [gameId]
    )
    .then(result =>{
        if(result.rows.length === 0){
            throw new Error('GAME_NOT_FOUND');
        }

        const game = result.rows[0];

        const now = new Date();

        const lastMoveAt = new Date(game.last_move_at);

        const elapsedSeconds = Math.floor(
            (now.getTime() - lastMoveAt.getTime()) / 1000
        );
        
        let remainingTime: number;

        if(game.turn === 'white'){
            remainingTime = game.white_time - elapsedSeconds;
        }else{
            remainingTime = game.black_time - elapsedSeconds;
        }

        if(remainingTime <= 0){
            throw new Error('TIMEOUT');
        }

        if(game.status !== 'PLAYING'){
            
            const winner = game.turn === 'white' ? 'BLACK' : 'WHITE';


            return pool.query(
                `UPDATE games
                SET
                    white_time = CASE
                        WHEN turn = 'white' THEN 0
                        ELSE white_time
                    END,
                    black_time = CASE
                        WHEN turn = 'black' THEN 0
                        ELSE black_time
                    END,
                    status = 'FINISHED',
                    result = $1,
                    result_reason = 'TIMEOUT',
                    finished_at = NOW(),
                    updated_at = NOW(),
                WHERE id = $2
                RETURNING * `,
                [winner, gameId]
            )
            .then(result => {
                return result.rows[0];
            });
        }

        let playerColor: 'white' | 'black';

        if(game.white_player_id === playerId){
            playerColor = 'white';
        }
        else if(game.black_player_id === playerId){
            playerColor = 'black';
        }
        else{
            throw new Error('PLAYER_NOT_IN_GAME');
        }

        if(game.turn !== playerColor){
            throw new Error('NOT_YOUR_TURN');
        }

        const engine = new ChessEngine();

        engine.loadGameState(game.board_state as GameState);

        const piece = engine.getPiece(from);

        if(!piece){
            throw new Error('PIECE_NOT_FOUND');
        }

        if(piece.color !== playerColor){
            throw new Error('PIECE_NOT_YOURS');
        }

        const legalMoves = engine.getLegalMoves(piece);

        if(!legalMoves.includes(to)){
            throw new Error('ILLEGAL_MOVE');
        }

        engine.movePiece(piece,to);

        const newGameState = engine.getGameState();

        const nextTurn = playerColor === 'white' ? 'black' : 'white';

        let gameStatus = 'PLAYING';
        let resultado = null;
        let resultReason = null;
        let finishedAt = null;

        if(newGameState.status === 'checkmate'){
            gameStatus = 'FINISHED';
            resultado = playerColor === 'white' ? 'WHITE' : 'BLACK';
            resultReason = 'CHECKMATE';
            finishedAt = new Date();
        }

        if(newGameState.status === 'draw'){
            gameStatus = 'FINISHED';
            resultado = 'DRAW';
            resultReason = 'DRAW';
            finishedAt = new Date();
        }

        let whiteTime = game.white_time;
        let blackTime = game.black_time;

        if(game.turn === 'white'){
            whiteTime = remainingTime + game.increment;
        }else{
            blackTime = remainingTime + game.increment;
        }

        return pool.query(
            `UPDATE games
            SET
                board_state = $1,
                turn = $2,
                status = $3,
                result = $4,
                result_reason = $5,
                finished_at = $6,
                white_time = $7,
                black_time = $8,
                updated_at = NOW(),
                last_move_at = NOW()
            WHERE id = $9
            RETURNING * `,
            [newGameState, nextTurn, gameStatus, resultado, resultReason, finishedAt, whiteTime, blackTime, gameId]
        )
        .then(result => {

            const updateGame = result.rows[0];

            return pool.query(
                `SELECT COALESCE(MAX(move_number), 0) + 1 AS move_number
                FROM game_moves
                WHERE game_id = $1`,
                [gameId]
            )
            .then(moveResult => {

                const moveNumber = moveResult.rows[0].move_number

                return pool.query(
                    `INSERT INTO game_moves(
                        game_id,
                        player_id,
                        move_number,
                        from_position,
                        to_position
                    )
                    VALUES($1, $2, $3, $4, $5)
                    RETURNING * `,
                    [gameId, playerId, moveNumber, from, to]
                )
                .then(() => {
                    return updateGame;
                });
            }); 
        });
    });
}


export function joinMatchmaking(
    userId: string,
    timeControl: string,
    increment: number,
    initialTime: number
){

    return pool.connect()
        .then(client => {
            
            return client.query('BEGIN')
                .then(() => {

                    return client.query(
                        `INSERT INTO matchmaking_queue(
                            user_id,
                            time_control,
                            increment,
                            initial_time
                        )
                        VALUES($1,$2,$3,$4)
                        RETURNING * `,
                        [userId, timeControl, increment, initialTime]
                    );

                })
                .then(result => {
                    const matchmaking = result.rows[0];

                    return client.query(
                        `SELECT 
                            users.elo
                        FROM users
                        WHERE id = $1`,
                        [userId]
                    )
                    .then(userResult =>{
                        if(userResult.rows.length === 0){
                            throw new Error('USER_NOT_FOUND');
                        }

                        const userElo =  userResult.rows[0].elo;

                        const joinedAt = new Date(matchmaking.joined_at);
                        const now = new Date();

                        const elapsedSeconds = Math.floor(
                            (now.getTime() - joinedAt.getTime()) / 1000
                        );

                        let eloRange = 100;

                        if(elapsedSeconds >= 30){
                            eloRange = 300;
                        }
                        else if(elapsedSeconds >=20){
                            eloRange = 200;
                        }
                        else if(elapsedSeconds >= 10){
                            eloRange = 150;
                        }

                        return client.query(
                            `SELECT 
                                *,
                                users.elo
                            FROM matchmaking_queue
                            INNER JOIN users
                                ON users.id = matchmaking_queue.user_id
                            WHERE matchmaking_queue.user_id <> $1
                            AND matchmaking_queue.time_control = $2
                            AND matchmaking_queue.increment  = $3
                            AND matchmaking_queue.initial_time = $4
                            AND users.elo BETWEEN $5 AND $6
                            AND NOT EXISTS(
                                SELECT 1
                                FROM games
                                WHERE status = 'PLAYING'
                                AND (
                                    (
                                        white_player_id = $1
                                        AND black_player_id = matchmaking_queue.user_id
                                    )
                                    OR
                                    (
                                        white_player_id = matchmaking_queue.user_id
                                        AND black_player_id = $1
                                    )
                                )
                            )
                            ORDER BY joined_at ASC
                            LIMIT 1
                            FOR UPDATE OF matchmaking_queue SKIP LOCKED`,
                            [
                                userId,
                                timeControl,
                                increment,
                                initialTime,
                                userElo - eloRange,
                                userElo + eloRange
                            ]
                        );
                    });
                })
                .then(result => {
                    
                    if(result.rows.length === 0){
                        
                        return client.query('COMMIT')
                            .then(() =>{
                                return {
                                    status: 'WAITING'
                                };
                            });
                    }

                    const oponent = result.rows[0];

                    const whitePlayerId = Math.random() < 0.5
                        ? oponent.user_id
                        : userId;

                    const blackPlayerId = whitePlayerId === userId ? oponent.user_id : userId;
                    
                    return createGame(
                        whitePlayerId,
                        blackPlayerId,
                        timeControl,
                        increment,
                        initialTime,
                        client
                    )
                    .then(game => {
                        
                        return client.query(
                            `DELETE FROM matchmaking_queue
                            WHERE user_id = $1
                            OR user_id = $2`,
                            [userId, oponent.user_id]
                        )
                        .then(() => {
                            
                            return client.query('COMMIT')
                                .then(() => {
                                    return {
                                        status: 'MATCHED',
                                        game
                                    };
                                });
                        });
                    });

                })
                .catch(error => {
                    
                    return client.query('ROLLBACK')
                        .then(() => {
                            throw error;
                        });

                })
                .finally(() => {
                    client.release();
                });

        });

}


export function cancelMatchmaking(userId: string){

    return pool.query(
        `DELETE FROM matchmaking_queue
        WHERE user_id = $1`,
        [userId]
    )
    .then(result => {

        return {
            cancelled: (result.rowCount ?? 0) > 0
        };

    });

}