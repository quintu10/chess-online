import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule,NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  email: string = '';
  password: string = '';

  errorMessage: string = '';

  constructor(private router: Router, private http: HttpClient){}

  login():void{
    if(!this.email.trim() || !this.password.trim()){
      return;
    }

    this.http.post<any>(
      'http://localhost:3000/auth/login',
      {
        email: this.email,
        password: this.password
      },
      {
        withCredentials: true
      }
    )
    .subscribe({
      next: response => {
        console.log('Usuario logueado correctamente', response);
        this.errorMessage = '';
        this.openHome();
      },
      error: error => {
        console.error('Error iniciando sesion', error);
        this.errorMessage = error.error.message;
      }
    });
  }
  
  loginWithGoogle():void{
    window.location.href= 'http://localhost:3000/auth/google';
  }

  openRegister(): void{
    this.router.navigate(['/register']);
  }

  openHome(): void{
    this.router.navigate(['/home']);
  }
}
