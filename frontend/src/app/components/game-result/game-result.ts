import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-game-result',
  imports: [NgIf],
  templateUrl: './game-result.html',
  styleUrl: './game-result.scss',
})
export class GameResult {
  
  @Input() result: 'white' | 'black' | 'draw' = 'draw';

}
