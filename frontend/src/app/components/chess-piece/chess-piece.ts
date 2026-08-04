import { Input,Component } from '@angular/core';
import { Piece } from '../../models/piece-model';

@Component({
  selector: 'app-chess-piece',
  imports: [],
  templateUrl: './chess-piece.html',
  styleUrl: './chess-piece.scss',
})
export class ChessPiece {

  @Input() piece!: Piece;
}
