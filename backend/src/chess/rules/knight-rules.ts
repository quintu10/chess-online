import { GameState } from "../models/game-state-model";
import { Piece } from "../models/piece-model";
import { COLUMNS } from "../utils/board-utils";

export function getKnightMoves(piece: Piece, gameState: GameState, getPiece: (position: string) => Piece | undefined):string[]{
    
    const moves: string[] = [];

    const initialColumn = piece.position[0];
    const initalRow = Number(piece.position[1]);

    const columnIndex = COLUMNS.indexOf(initialColumn);

    //Arriba derecha
    if(initalRow + 2 <= 8 && columnIndex + 1 <= 7){
        const newPosition = (COLUMNS[columnIndex + 1]) + (initalRow + 2);
        const possiblePiece = getPiece(newPosition);
        if(!possiblePiece)
            moves.push(newPosition);
        else if(possiblePiece.color !== piece.color){
            moves.push(newPosition)
        }
    }

    //Arriba izquierda
    if(initalRow + 2 <= 8 && columnIndex - 1 >= 0){
        const newPosition = (COLUMNS[columnIndex - 1]) + (initalRow + 2);
        const possiblePiece = getPiece(newPosition);
        if(!possiblePiece)
            moves.push(newPosition);
        else if(possiblePiece.color !== piece.color){
            moves.push(newPosition)
        }
    }

    //Abajo derecha
    if(initalRow - 2 >= 1 && columnIndex + 1 <= 7){
        const newPosition = (COLUMNS[columnIndex + 1]) + (initalRow - 2);
        const possiblePiece = getPiece(newPosition);
        if(!possiblePiece)
            moves.push(newPosition);
        else if(possiblePiece.color !== piece.color){
            moves.push(newPosition)
        }
    }

    //Abajo izquierda
    if(initalRow - 2 >= 1 && columnIndex - 1 >= 0){
        const newPosition = (COLUMNS[columnIndex - 1]) + (initalRow - 2 );
        const possiblePiece = getPiece(newPosition);
        if(!possiblePiece)
            moves.push(newPosition);
        else if(possiblePiece.color !== piece.color){
            moves.push(newPosition)
        }
    }

    //Derecha arriba
    if(initalRow + 1 <= 8 && columnIndex + 2 <= 7){
        const newPosition = (COLUMNS[columnIndex + 2]) + (initalRow + 1);
        const possiblePiece = getPiece(newPosition);
        if(!possiblePiece)
            moves.push(newPosition);
        else if(possiblePiece.color !== piece.color){
            moves.push(newPosition)
        }
    }

    //Derecha abajo
    if(initalRow - 1 >= 1 && columnIndex + 2 <= 7){
        const newPosition = (COLUMNS[columnIndex + 2]) + (initalRow - 1);
        const possiblePiece = getPiece(newPosition);
        if(!possiblePiece)
            moves.push(newPosition);
        else if(possiblePiece.color !== piece.color){
            moves.push(newPosition)
        }
    }

    //Izquierda arriba
    if(initalRow + 1 <= 8 && columnIndex - 2 >= 0){
        const newPosition = (COLUMNS[columnIndex - 2]) + (initalRow + 1);
        const possiblePiece = getPiece(newPosition);
        if(!possiblePiece)
            moves.push(newPosition);
        else if(possiblePiece.color !== piece.color){
            moves.push(newPosition)
        }
    }

    //Izquierda abajo
    if(initalRow - 1 >= 1 && columnIndex - 2 >= 0){
        const newPosition = (COLUMNS[columnIndex - 2]) + (initalRow - 1);
        const possiblePiece = getPiece(newPosition);
        if(!possiblePiece)
            moves.push(newPosition);
        else if(possiblePiece.color !== piece.color){
            moves.push(newPosition)
        }
    }


    return moves;
}