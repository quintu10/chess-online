import { Input,Output,Component, EventEmitter } from '@angular/core';
import { Piece } from '../../models/piece-model';

@Component({
  selector: 'app-chess-piece',
  imports: [],
  templateUrl: './chess-piece.html',
  styleUrl: './chess-piece.scss',
})
export class ChessPiece {

  @Input() piece!: Piece;

  @Input() selected: boolean = false;

  @Output() pieceSelected = new EventEmitter<Piece>();

  selectPiece(){
    this.pieceSelected.emit(this.piece);
  }
}
