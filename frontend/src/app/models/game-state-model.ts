import { Move } from "./move-model";
import { Piece } from "./piece-model";

export interface GameState{
    
    pieces: Piece[],
    turn: 'white' | 'black',
    status:'playing' | 'checkmate' | 'draw',
    lastMove: Move | null,
}