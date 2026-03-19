import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- ESTO ES LO QUE FALTA
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // <--- ASEGÚRATE DE QUE FormsModule ESTÉ AQUÍ
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  usuario: string = '';
  contrasena: string = '';
  mensajeError: string = '';

  constructor(private router: Router) {}

  iniciarSesion() {
    if (!this.usuario || !this.contrasena) {
      this.mensajeError = 'Por favor, ingresa tu usuario y contraseña.';
      return;
    }
    if (this.usuario === 'admin' && this.contrasena === '1234') {
      this.mensajeError = '';
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.mensajeError = 'Usuario o contraseña incorrectos.';
    }
  }
}