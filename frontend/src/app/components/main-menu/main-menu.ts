import { Component } from '@angular/core';
import { ChessBoard } from '../chess-board/chess-board';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Session } from '../../services/session';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-main-menu',
  imports: [ChessBoard,RouterLink,FormsModule,CommonModule],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.scss',
})
export class MainMenu {

  constructor(private sesionService: Session, private router: Router){}

  showLocalGameModal = false;
  playerName = '';


  openLocalGame(): void{
    this.showLocalGameModal = true;
  }

  cancelLocalGame(): void{
    this.playerName = '';
    this.showLocalGameModal = false;
  }

  startLocalGame(): void{
    if(!this.playerName.trim()){
      return;
    }

    this.sesionService.playerName = this.playerName.trim();
    this.sesionService.gameMode = 'offline';

    this.showLocalGameModal = false;

    this.router.navigate(['/board']);
  }

  openLogin(){
    this.router.navigate(['/login']);
  }

  openRegister(){
    this.router.navigate(['/register']);
  }
}
