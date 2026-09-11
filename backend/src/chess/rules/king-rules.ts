import { GameState } from "../models/game-state-model";
import { Piece } from "../models/piece-model";
import { COLUMNS } from "../utils/board-utils";

export function getKingMoves(piece: Piece, gameState: GameState, getPiece: (position: string) => Piece | undefined):string[]{
    
    const moves: string[] = [];
    
    const initialColumn = piece.position[0];
    const initialRow = Number(piece.position[1]);

    
    const columnIndex = COLUMNS.indexOf(initialColumn)

    //Arriba
    if(initialRow + 1 <= 8){
        const newPosition = initialColumn + (initialRow + 1);
        let possiblePiece = getPiece(newPosition);
        
        if(possiblePiece){
            if(possiblePiece.color !== piece.color){
                moves.push(newPosition);
            }
        
        }else{
            moves.push(newPosition);
        }

    }    

    //Abajo
    if(initialRow - 1 >= 1){
        const newPosition = initialColumn + (initialRow - 1);
        let possiblePiece = getPiece(newPosition);
        
        if(possiblePiece){
            if(possiblePiece.color !== piece.color){
                moves.push(newPosition);
            }
        
        }else{
            moves.push(newPosition);
        }

    }     
        
    //Izquierda
    if(columnIndex - 1 >= 0){
        const newPosition = (COLUMNS[columnIndex - 1]) + initialRow;
        let possiblePiece = getPiece(newPosition);
        
        if(possiblePiece){
            if(possiblePiece.color !== piece.color){
                moves.push(newPosition);
            }
        
        }else{
            moves.push(newPosition);
        }

    } 

    //Derecha
    if(columnIndex + 1 <= 7){
        const newPosition = (COLUMNS[columnIndex + 1]) + initialRow;
        let possiblePiece = getPiece(newPosition);
        
        if(possiblePiece){
            if(possiblePiece.color !== piece.color){
                moves.push(newPosition);
            }
        
        }else{
            moves.push(newPosition);
        }

    }
    
    //Diagonal derecha arriba
    if(columnIndex + 1 <= 7 && initialRow + 1 <= 8){
        const newPosition = (COLUMNS[columnIndex + 1]) + (initialRow + 1);
        let possiblePiece = getPiece(newPosition);
        
        if(possiblePiece){
            if(possiblePiece.color !== piece.color){
                moves.push(newPosition);
            }
        
        }else{
            moves.push(newPosition);
        }

    } 

    //Diagonal derecha abajo
    if(columnIndex + 1 <= 7 && initialRow - 1 >= 1){
        const newPosition = (COLUMNS[columnIndex + 1]) + (initialRow - 1);
        let possiblePiece = getPiece(newPosition);
        
        if(possiblePiece){
            if(possiblePiece.color !== piece.color){
                moves.push(newPosition);
            }
        
        }else{
            moves.push(newPosition);
        }

    } 

    //Diagonal izquierda arriba
    if(columnIndex - 1 >= 0 && initialRow + 1 <= 8){
        const newPosition = (COLUMNS[columnIndex - 1]) + (initialRow + 1);
        let possiblePiece = getPiece(newPosition);
        
        if(possiblePiece){
            if(possiblePiece.color !== piece.color){
                moves.push(newPosition);
            }
        
        }else{
            moves.push(newPosition);
        }

    } 

    //Diagonal izquierda abajo
    if(columnIndex - 1 >= 0 && initialRow - 1 >= 1){
        const newPosition = (COLUMNS[columnIndex - 1]) + (initialRow - 1);
        let possiblePiece = getPiece(newPosition);
        
        if(possiblePiece){
            if(possiblePiece.color !== piece.color){
                moves.push(newPosition);
            }
        
        }else{
            moves.push(newPosition);
        }

    } 

    if(piece.hasMoved){
        return moves;
    }

    const rowKing = piece.color === 'white' ? 1 : 8
    

    const kingSideRook = getPiece('H' + rowKing);
    const queenSideRook = getPiece('A' + rowKing)

    if(kingSideRook?.name === 'rook' && !kingSideRook.hasMoved){
        const kingSideBishop = getPiece('F' + rowKing);
        const kingSideKnight = getPiece('G' + rowKing);
        if(!kingSideBishop && !kingSideKnight){
            //Enroque disponible
            const newPosition = ('G' + rowKing);
            moves.push(newPosition);
        }
    }

    if(queenSideRook?.name === 'rook' && !queenSideRook.hasMoved){
        const queenSide = getPiece('D' + rowKing);
        const queenSideBishop = getPiece('C' + rowKing);
        const queenSideKnight = getPiece('B' + rowKing);
        if(!queenSide && !queenSideBishop && !queenSideKnight){
            //Enroque disponible
            const newPosition = ('C' + rowKing);
            moves.push(newPosition);
        }
    }


    return moves;
}