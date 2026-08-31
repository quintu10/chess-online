import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  imports: [FormsModule,NgIf],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  avatar: File | null = null;
  avatarPreview: string | null = null;

  errorMessage: string = '';

  constructor(private router: Router, private http: HttpClient){}

  register():void{
    if(!this.email.trim() || !this.username.trim() || !this.password.trim()){
      console.log('Complete todos los campos');
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }
    
    if (!this.isConfirmPassword()) {
      return;
    }

    if(!this.isValidEmail()){
      return;
    }

    if(!this.isValidPassword()){
      return;
    }

    const formData = new FormData();

    formData.append('email', this.email.trim());
    formData.append('username', this.username.trim());
    formData.append('password', this.password);

    if (this.avatar) {
      formData.append('avatar', this.avatar);
    }
      
    this.http.post<any>(
      'http://localhost:3000/auth/register',
      formData,
      {
        withCredentials: true
      }
    )
    .subscribe({
      next: response => {
        console.log('Usuario registrado correctamente', response);
        this.errorMessage= '';
        this.login();
      },
      error: error => {
        console.error('Error registrando usuario', error);
        if(error.status === 409){
          this.errorMessage = error.error.message;
          return;
        }

        this.errorMessage = 'Error registrando usuario';
        console.log('Error registrando usuario');
      }
    });

  }

  isConfirmPassword():boolean{
    if(!this.confirmPassword.trim()){
      console.error('Confirme la contraseña');
      this.errorMessage = 'Confirme la contraseña';
      return false;
    }
    if(this.confirmPassword !== this.password){
      console.error('Las contraseñas no coinciden');
      this.errorMessage = 'Las contraseñas no coinciden';
      return false;
    }
    return true;
  }

  loginWithGoogle():void{
    window.location.href= 'http://localhost:3000/auth/google';
  }

  isValidEmail(): boolean{
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(this.email.trim())){
      this.errorMessage = 'Ingrese un email valido';
      return false;
    }

    return true;
  }

  isValidPassword(): boolean{
    if(this.password.length < 8){
      this.errorMessage = 'La contraseña debe contener al menos 8 caracteres';
      return false;
    }

    return true;
  }

  onAvatarSelected(event: Event): void{
    const input = event.target as HTMLInputElement;

    if(input.files && input.files.length > 0){
      this.avatar = input.files[0];
      
      this.avatarPreview = URL.createObjectURL(this.avatar);

    }
  }

  removeAvatar(event: Event): void {
    event.stopPropagation();

    this.avatar = null;
    this.avatarPreview = null;

    const input = document.getElementById('avatar') as HTMLInputElement;

    if (input) {
      input.value = '';
    }
  }

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
        this.errorMessage = 'Contraseña incorrecta';
      }
    });
  }
 
  openLogin(){
    this.router.navigate(['/login']);
  }

  openHome(){
    this.router.navigate(['/home']);
  }

}
