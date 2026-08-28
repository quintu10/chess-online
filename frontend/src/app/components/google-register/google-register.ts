import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-google-register',
  imports: [FormsModule,NgIf],
  templateUrl: './google-register.html',
  styleUrl: './google-register.scss',
})
export class GoogleRegister implements OnInit {

  token: string | null = null;

  email: string = '';
  avatar: string | null = null;
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  loading: boolean = true;  
  errorMessage : string = '';

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient){}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if(!this.token){
      console.error('No hay token de google');
      return;
    }

    this.http.get<any>(
      `http://127.0.0.1:3000/auth/google/pending?token=${this.token}`,
      {
        withCredentials: true
      }
    )
      .subscribe({
        next: response => {
          this.email = response.email;
          this.avatar = response.avatar;
          
          console.log('Usuario pendiente de google', response);
        
          this.loading = false;
        },

        error: error => {
          console.error('Error obteniendo usuario de google', error);
          
          this.loading = false;
        }
      });
  }

  isConfirmPassword():boolean{
    if(!this.confirmPassword.trim()){
      console.error('Confirme la contraseña');
      this.errorMessage = 'Confirme la contraseña'
      return false;
    }
    if(this.confirmPassword !== this.password){
      console.error('Las contraseñas no coinciden');
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }
    return true;
  }

  completeRegistration(): void{
    if(!this.token || !this.username.trim() || !this.password.trim()){
      console.error('Complete todos los campos solicitados por favor');
      this.errorMessage = 'Por favor, complete todos los campos'
      return;
    }

    if(!this.isConfirmPassword()){
      return;
    }

    if(!this.isValidPassword()){
      return;
    }

    this.http.post<any>(
      'http://127.0.0.1:3000/auth/google/register',
      {
        token: this.token,
        username: this.username.trim(),
        password: this.password
      },
      {
        withCredentials: true
      },
    )
    .subscribe({
      next: response => {
        console.log('Registro completado', response);
        this.errorMessage = '';
      },

      error: error => {
        console.error('Error registrando usuario', error);
        if(error.status === 409){
          this.errorMessage = error.error.message;
          return;
        }

        this.errorMessage = error.error.message;
        console.log('Error registrando usuario' );
      }
    });
  }

  isValidPassword(): boolean{
    if(this.password.length < 8){
      this.errorMessage = 'La contraseña debe contener al menos 8 caracteres';
      return false;
    }

    return true;
  }

}
