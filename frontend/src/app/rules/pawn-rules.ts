import { GameState } from "../models/game-state-model";
import { Piece } from "../models/piece-model";
import { COLUMNS } from "../utils/board-utils";

export function getPawnMoves(piece: Piece, gameState: GameState, getPiece: (position:string) => Piece | undefined ): string[] {

    //Moviemientos 
    const moves: string[] = [];
    const lastMove = gameState.lastMove;

    // Posicion de inicio de la pieza
    const column = piece.position[0];
    const row = Number(piece.position[1]);
    const inPassantRow = piece.color === 'white' ? 5 : 4;

    
    //Para posibles movimientos en diagonal 
    const columnIndex = COLUMNS.indexOf(column)
    const leftColumn = COLUMNS[columnIndex - 1];
    const rightColumn = COLUMNS[columnIndex + 1];
    
    //para no repetir sobre blancas y negras tanto la direccion como si esta en la posicion de inicio
    const direction = piece.color === 'white' ? 1 : -1;
    const starRow = piece.color === 'white' ? 2 : 7;

    //Posibles movimientos diagonales
    const leftDiagonal = leftColumn + (row + direction);
    const rightDiagonal = rightColumn + (row + direction);
    
    //Posibles movimientos frontales
    const nextPosition = column + (row + direction);
    const doublePosition = column + (row + direction * 2);

    const pieceInFront = getPiece(nextPosition)

    if(!pieceInFront){
        moves.push(nextPosition)
        if(starRow === row){
            const doubleInFront = (getPiece(doublePosition))
            if(!doubleInFront){
                moves.push(doublePosition);
            }
        }
    }

    // Agrego posibles movimientos en diagonal para tomar piezas del rival

    if (leftColumn) {

        const leftPiece = getPiece(leftDiagonal);

        if (leftPiece && leftPiece.color !== piece.color) {

            moves.push(leftDiagonal);

        }

    }

    if (rightColumn) {

        const rightPiece = getPiece(rightDiagonal);

        if (rightPiece && rightPiece.color !== piece.color) {

            moves.push(rightDiagonal);

        }

    }

    if(row === inPassantRow){
        if(!lastMove)
            return moves;
        
        //Consigo la pieza que realizo el ultimo movimiento
        const lastMovePiece = getPiece(lastMove.to);
        
        //Pregunto si existe la pieza
        if(!lastMovePiece)
            return moves;
        
        //Pregunto si la pieza que realizo el ultimo movimiento es un peon
        if(lastMovePiece.name !== 'peon')
            return moves;

        //Pregunto si el peon que realizo el ultimo movimiento esta a la derecho o a la izquierda
        if(lastMove.to !== (rightColumn + row) && lastMove.to !== (leftColumn + row))
            return moves;

        const inPassantInitialRow = lastMovePiece.color === 'white' ? 2 : 7

        //Pregunto si el peon que realizo el ultimo movimiento se movio 2 casillas hacia delante para ver si se puede comer al paso
        if(lastMove.from !== (rightColumn + inPassantInitialRow) && lastMove.from !== (leftColumn + inPassantInitialRow))
            return moves;

        //Se puede comer al paso si llegamos hasta aca

        const passantMove = (lastMove.to[0] + (Number(lastMove.to[1]) + direction))
        moves.push(passantMove);

    }    


    return moves;
}
