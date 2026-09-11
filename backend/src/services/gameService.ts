import { pool } from "../config/database"
import { ChessEngine } from "../chess/engine/chess-engine";
import { GameState } from "../chess/models/game-state-model";
import { InitialPieces } from "../chess/data/initial-pieces";
import { error } from "console";

export function createGame(
    playerId: string,
    timeControl: string,
    increment: number,
    initialTime: number,
    boardState: GameState
)
{

    const initialGameState: GameState = {
        pieces: InitialPieces.map(piece => ({...piece})),
        turn: 'white',
        status: 'playing',
        lastMove: null
    }

    return pool.query(
        `INSERT INTO games(
            white_player_id,
            time_control,
            increment,
            white_time,
            black_time,
            board_state,
            turn,
            status,
            last_move_at
        )
        VALUES($1, $2, $3, $4, $4, $5, 'white', 'WAITING', NOW())
        RETURNING * `,
        [
            playerId,
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

export function joinGame(
    gameId: string,
    playerId: string,
    color: 'white' | 'black'
)
{

    const playerColumn = 
        color === 'white'
        ? 'white_player_id'
        : 'black_player_id';

    return pool.query(
        `UPDATE games
        SET 
            ${playerColumn} = $1,
            status = 'PLAYING',
            updated_at = NOW(),
            last_move_at = NOW()
        WHERE id = $2
            AND status = 'WAITING'
            AND ${playerColumn} IS NULL
        RETURNING * `,
        [playerId, gameId]
    )
    .then( result => {
        if(result.rows.length === 0){
            throw new Error('GAME_NOT_AVAILABLE');
        }

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

