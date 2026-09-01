import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { errorContext } from 'rxjs/internal/util/errorContext';

@Component({
  selector: 'app-home',
  imports: [FormsModule,CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit{

  user: any | null = null;
  errorMessage: string = '';

  constructor(private router:Router, private http: HttpClient){}

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

  }
  
  startLocalGame():void{

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

}
