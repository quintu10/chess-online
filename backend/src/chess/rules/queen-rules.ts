import { GameState } from "../models/game-state-model";
import { Piece } from "../models/piece-model";
import { COLUMNS } from "../utils/board-utils";
import { getBishopMoves } from "./bishop-rules";
import { getRookMoves } from "./rook-rules";

export function getQueenMoves(piece: Piece, gameState: GameState, getPiece: (position: string) => Piece | undefined):string[]{
    
    const moves: string[] = [];
    
    const verticalHorizontalMoves: string[] = getRookMoves(piece,gameState, getPiece)
    const diagonalMoves: string [] = getBishopMoves(piece, gameState, getPiece)

    for(const move of verticalHorizontalMoves){
        moves.push(move);
    }

    for(const move of diagonalMoves){
        moves.push(move);
    }

    return moves;
}