import { Component } from '@angular/core';
import { ChessBoard } from '../chess-board/chess-board';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-main-menu',
  imports: [ChessBoard,RouterLink],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.scss',
})
export class MainMenu {}
