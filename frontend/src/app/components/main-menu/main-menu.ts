import { Component, OnInit } from '@angular/core';
import { ChessBoard } from '../chess-board/chess-board';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Session } from '../../services/session';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-main-menu',
  imports: [ChessBoard,RouterLink,FormsModule,CommonModule],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.scss',
})
export class MainMenu implements OnInit{

  constructor(private sesionService: Session, private router: Router, private http: HttpClient){}

  showLocalGameModal = false;
  playerName = '';

  loading: boolean = true; 

  user : any | null = null;
  errorMessage: string = '';

  ngOnInit(): void {
    this.http.get<any>(
      'http://localhost:3000/auth/me',
      { withCredentials: true}
    )
    .subscribe({
      next: response =>{
        this.user = response.user;
        this.loading = false;
      },
      error: () => {
        this.user = null;
        this.loading = false;
      }
    });
  }

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

  logout(): void{
    if(!this.user){
      return;
    }

    this.http.post<any>(
      'http://localhost:3000/auth/logout',
      {},
      {
        withCredentials: true
      }
    )
    .subscribe({
      next: Response =>{
        this.user = null;
        this.errorMessage = '';
        console.log("Sesion cerrada correctamente");
      },
      
      error: error =>{
        this.errorMessage = 'No se pudo cerrar la sesion';
        console.log("Error cerrando sesion");
      }
    });

  }

  openLogin(): void{
    this.router.navigate(['/login']);
  }

  openHome(): void{
    if(!this.user){
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/home']);
  }

  openRegister(): void{
    this.router.navigate(['/register']);
  }

}
