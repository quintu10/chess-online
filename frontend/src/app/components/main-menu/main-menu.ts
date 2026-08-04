import { Component } from '@angular/core';
import { ChessBoard } from '../chess-board/chess-board';

@Component({
  selector: 'app-main-menu',
  imports: [ChessBoard],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.scss',
})
export class MainMenu {}
