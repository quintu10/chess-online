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

  getPieceImage():string{
    const color = this.piece.color === 'white' ? 'white' : 'black';

    const piece = this.getPieceName(this.piece.name);

    return `assets/pieces/${color}-${piece}.png`
  }


  getPieceName(name: string): string{
    if(name === 'pawn')
      return 'pawn'
    if(name === 'rook')
      return 'rook'
    if(name === 'knight')
      return 'knight';
    if(name === 'bishop')
      return 'bishop';
    if(name === 'queen')
      return 'queen';
    if(name === 'king')
      return 'king';

    return 'pawn';

  }
}
