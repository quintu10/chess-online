import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { errorContext } from 'rxjs/internal/util/errorContext';
import { Session } from '../../services/session';
import { onlineGameService } from '../../services/online-game';
import { SocketService } from '../../services/socket-service';

@Component({
  selector: 'app-home',
  imports: [FormsModule,CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit{

  user: any | null = null;
  errorMessage: string = '';

  searchingMatch: boolean = false;

  constructor(private router:Router, private http: HttpClient,private sessionService: Session, private onlineGame: onlineGameService,
              private socketService: SocketService){}

  ngOnInit(): void {
    this.http.get<any>(
      'http://localhost:3000/auth/me',
      {
        withCredentials: true
      }
    )
    .subscribe({
      next : response => {
        console.log("Usuario: ", response)
        this.user = response.user;
        console.log('IDENTIFICANDO SOCKET: ', this.user.id);
        this.socketService.identifyUser(this.user.id);

        this.socketService.onMatchFound((game) => {
          console.log('MATCH ENCONTRADO: ', game);

          this.searchingMatch = false;

          this.onlineGame.gameId = game.id;

          this.router.navigate(['/board']);
        });
        console.log('LISTENER MATCH-FOUND REGISTRADO');
      },
      error: error => {
        console.log("Error obteniendo usuario",error);
        this.user = null;
      }
    });
  }
  

  logout():void{
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
        console.log("Sesion cerrada correctamente");
        this.user = null;
        this.errorMessage= '';
        this.openMenu();
      },
      error: error => {
        console.log("Error cerrando sesion");
        this.errorMessage = 'Error cerrando sesion';
      }
    });
  }

  startOnlineGame():void{

    if(!this.user){
      return;
    }

    this.searchingMatch = true;

    this.http.post<any>(
      'http://localhost:3000/games/matchmaking',
      {
        playerId: this.user.id,
        timeControl:10 + 0,
        increment: 0,
        initialTime: 600
      }
    )
    .subscribe({
      next: response => {
        console.log('Respuesta matchmaking: ', response);

        if(response.status === 'WAITING'){
          console.log('Buscando rival...');
          return;
        }

        if(response.status === 'MATCHED'){
          console.log('Partida encontrada:' , response.game);

          this.searchingMatch = false;

          this.onlineGame.gameId = response.game.id;

          this.router.navigate(['/board']);
        }

      },
      error: error =>{
        console.error('Error entrando al matchmaking', error);

        this.searchingMatch = false;
      }
    });
  }
  
  startLocalGame():void{
    this.sessionService.playerName = this.user.username;
    this.sessionService.gameMode = 'offline';

    this.router.navigate(['/board'])
  }

  openMenu():void{
    this.router.navigate(['/']);
  }

  openHome():void{
    this.router.navigate(['/home']);
  }

  openAbout():void{
    this.router.navigate(['/home']);
  }

  openHowToPlay():void{
    this.router.navigate(['/home']);
  }

  openRanking():void{
    this.router.navigate(['/home']);
  }

  cancelMatchmaking():void{
    
    if(!this.user){
      return;
    }

    this.http.delete<any>(
      'http://localhost:3000/games/matchmaking',
      {
        body: {
          userId: this.user.id
        }
      }
    )
    .subscribe({
      next: response => {
        console.log('Busqueda cancelada: ', response);

        this.searchingMatch = false;
      },
      error: error => {
        console.error('Error cancelando matchmaking: ', error);
      }
    });
    
  }

}
