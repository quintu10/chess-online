import { Request, Response } from "express";
import { createGame, getActiveGamesByPlayer, getGameById, joinGame, makeMove } from "../services/gameService";




export function createGameController (req: Request, res: Response){

    const{
        playerId,
        timeControl,
        increment,
        initialTime,
        boardState,
    } = req.body;

    return createGame(
        playerId,
        timeControl,
        increment,
        initialTime,
        boardState
    )
    .then(game => {
        res.status(201).json(game);
    })
    .catch(error => {
        console.error(error);

        res.status(500).json({
            message: 'Error al crear partida'
        });
    });
}

export  function joinGameController(req: Request, res: Response){
    const gameId = req.params.gameId as string;

    const {
        playerId,
        color
    } = req.body;

    return joinGame(
        gameId,
        playerId,
        color
    )
    .then(game => {
        res.status(201).json(game);
    })
    .catch(error => {
        console.error(error);

        if(error.message = 'GAME_NOT_AVAILABLE'){
            return res.status(409).json({
                message: 'La partida ya no esta disponible'
            });
        }

        return res.status(500).json({
            message: 'Error al unirse a la partida'
        });
    });

}

export function getGameController(req: Request, res: Response){
    const gameId = req.params.gameId as string;

    return getGameById(gameId)
        .then(game => {
            res.status(201).json(game);
        })
        .catch(error => {
            console.error(error);

            if(error.message === 'GAME_NOT_FOUND'){
                return res.status(404).json({
                    message: 'Partida no encontrada'
                });
            }

            return res.status(500).json({
                message: 'Error al obtener la partida'
            });
        });
}

export function getActiveGamesController(req: Request, res: Response){

    const playerId = req.params.playerId as string;

    return getActiveGamesByPlayer(playerId)
        .then(games => {
            return res.status(201).json(games);
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({
                message: 'Error al obtener las partidas activas'
            });
        });
}

export function makeMoveController(req: Request, res: Response){
    
    const gameId = req.params.gameId as string;

    const {
        playerId,
        from,
        to
    } = req.body;


    return makeMove(
        gameId,
        playerId,
        from,
        to
    )
    .then(game => {
        res.status(201).json(game);
    })
    .catch(error => {
        console.error(error);
        
        if(error.message === 'GAME_NOT_FOUND'){
            return res.status(404).json({
                message: 'Partida no encontrada'
            });
        }

        if(error.message === 'GAME_NOT_PLAYING'){
            return res.status(409).json({
                message: 'La artida no esta en juego'
            });
        }

        if(error.message === 'TIMEOUT'){
            return res.status(409).json({
                message: 'Se acabo el tiempo'
            })
        }

        if(error.message === 'PLAYER_NOT_IN_GAME'){
            return res.status(403).json({
                message: 'El jugador no perteece a esta partida'
            });
        }

        if(error.message === 'NOT_YOUR_TURN'){
            return res.status(409).json({
                message: 'No es tu turno'
            });
        }

        if(error.message === 'PIECE_NOT_FOUND'){
            return res.status(400).json({
                message: 'No existe una pieza en esa posicion'
            });
        }

        if(error.message === 'PIECE_NOT_YOURS'){
            return res.status(403).json({
                message: 'La pieza no pertece al jugador'
            });
        }

        if(error.message === 'ILLEGAL_MOVE'){
            return res.status(400).json({
                message: 'Movimiento ilegal'
            });
        }

        return res.status(500).json({
            message:'Error al realizar el movimiento'
        });
    });


}