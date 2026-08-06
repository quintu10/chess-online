import { GameState } from "../models/game-state-model";
import { Piece } from "../models/piece-model";
import { COLUMNS } from "../utils/board-utils";

export function getBishopMoves(piece: Piece, gameState: GameState, getPiece: (position: string) => Piece | undefined):string[]{
    
    const moves: string[] = [];
    
    const initialColumn = piece.position[0];
    const initialRow = Number(piece.position[1]);
    
    const columnIndex = COLUMNS.indexOf(initialColumn)
    
    //Diagonal derecha arriba
    let obstaculo: Piece | undefined = undefined;
    let cont = 1;    
    while(obstaculo === undefined && initialRow + cont <=8 && columnIndex + cont <=7){
        let newPosition = ((COLUMNS[columnIndex + cont]) + (initialRow + cont))
        
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
    
    //Diagonal izquierda abajo
    obstaculo = undefined;
    cont = 1; 
    while(obstaculo === undefined && initialRow - cont >= 1 && columnIndex - cont >=0){
        let newPosition = ((COLUMNS[columnIndex - cont]) + (initialRow - cont))

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

    //Diagonal izquierda arriba
    obstaculo = undefined;
    cont = 1;
    while(obstaculo === undefined && initialRow + cont <= 8 &&columnIndex - cont >= 0){
        let newPosition = ((COLUMNS[columnIndex - cont]) + (initialRow + cont))

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
    
    //Diagonal derecha abajo
    obstaculo = undefined;
    cont = 1; 
    while(obstaculo === undefined && initialRow - cont >= 1&& columnIndex + cont <=7){
        let newPosition = ((COLUMNS[columnIndex + cont]) + (initialRow - cont))

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