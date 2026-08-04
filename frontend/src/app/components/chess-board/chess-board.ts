import { NgFor,NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Piece } from '../../models/piece-model';
import { ChessPiece } from '../chess-piece/chess-piece';
import { InitialPieces } from '../../data/initial-pieces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chess-board',
  imports: [NgFor,ChessPiece,NgIf],
  templateUrl: './chess-board.html',
  styleUrl: './chess-board.scss',
})
export class ChessBoard {

  rows = [8, 7, 6, 5, 4, 3, 2, 1];
  columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  pieces: Piece[] = InitialPieces;
  selectedPiece: Piece | null = null;

  selectPiece(piece: Piece){
    this.selectedPiece = piece;
  }

  getPiece(position: string): Piece | undefined {

    return this.pieces.find(
      piece => piece.position === position
    );

  }
}
