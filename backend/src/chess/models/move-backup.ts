import { Move } from "./move-model";
import { Piece } from "./piece-model";

export interface moveBackup{
    piece: Piece,
    oldPosition: string,
    hasMoved: boolean,

    capturedPiece?: Piece,

    rook?: Piece,
    rookOldPosition?: string,
    rookHasMoved?: boolean,
    

    lastMove: Move | null,
}