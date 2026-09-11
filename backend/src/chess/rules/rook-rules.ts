import { GameState } from "../models/game-state-model";
import { Piece } from "../models/piece-model";
import { COLUMNS } from "../utils/board-utils";

export function getRookMoves(piece: Piece, gameState: GameState, getPiece: (position: string) => Piece | undefined):string[]{
    
    const moves: string[] = [];
    
    const initialColumn = piece.position[0];
    const initialRow = Number(piece.position[1]);

    const columnIndex = COLUMNS.indexOf(initialColumn)
    
    //Arriba
    let obstaculo: Piece | undefined = undefined;
    let cont = 1;    
    while(obstaculo === undefined && initialRow + cont <=8){
        let newPosition = (initialColumn + (initialRow + cont))
        
        obstaculo = getPiece(newPosition); 
        if(obstaculo !== undefined){
            if(obstaculo.color !== piece.color)
                moves.push(newPosition)
            else
                break;
        }else{
            moves.push(newPosition)
            cont++;
        }
    }
    
    //Abajo
    obstaculo = undefined;
    cont = 1; 
    while(obstaculo === undefined && initialRow - cont >= 1){
        let newPosition = (initialColumn + (initialRow - cont))

        obstaculo = getPiece(newPosition); 
        if(obstaculo !== undefined){
            if(obstaculo.color !== piece.color)
                moves.push(newPosition)
            else
                break;
        }else{
            moves.push(newPosition)
            cont++;
        }
    }

    //Izquierda
    obstaculo = undefined;
    cont = 1;
    while(obstaculo === undefined && columnIndex - cont >= 0){
        let newPosition = ((COLUMNS[columnIndex - cont]) + initialRow)

        obstaculo = getPiece(newPosition); 
        if(obstaculo !== undefined){
            if(obstaculo.color !== piece.color)
                moves.push(newPosition)
            else
                break;
        }else{
            moves.push(newPosition)
            cont++;
        }
    }
    
    //Derecha
    obstaculo = undefined;
    cont = 1; 
    while(obstaculo === undefined &&columnIndex + cont <=7){
        let newPosition = ((COLUMNS[columnIndex + cont]) + initialRow)

        obstaculo = getPiece(newPosition); 
        if(obstaculo !== undefined){
            if(obstaculo.color !== piece.color)
                moves.push(newPosition)
            else
                break;
        }else{
            moves.push(newPosition)
            cont++;
        }
    }

    return moves; 
}