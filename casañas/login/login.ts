import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router'; 

import { AuthService } from '../../services/auth'; // Tu ruta original intacta

@Component({
  selector: 'app-login-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  vistaActual: 'login' | 'registro' | 'recuperar' = 'login';
  loginData = { correo: '', password: '' };
  registroData = {
    nombre: '', correo: '', telefono: '', 
    password: '', confirmarPassword: '',
    calle: '', colonia: '', cp: '', referencias: ''
  };
  metodoRecuperacion: 'correo' | 'whatsapp' = 'correo'; 
  recuperarCorreo = ''; recuperarTelefono = '';

  intentoLogin = false; intentoRegistro = false; intentoRecuperar = false;
  mostrarModalError = false; mostrarModalExito = false; mostrarModalRecuperar = false;
  mensajeModal = '';

  constructor(private authService: AuthService, private router: Router) {}

  cambiarVista(vista: 'login' | 'registro' | 'recuperar') {
    this.vistaActual = vista;
    this.intentoRegistro = false; this.intentoLogin = false; this.intentoRecuperar = false;
  }

  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) event.preventDefault();
  }

  // 🚩 Le regresé la validación de 25 caracteres máximo que hicimos hace ratito para más seguridad
  get nombreValido() { 
    const longitud = this.registroData.nombre.trim().length;
    return longitud >= 3 && longitud <= 25; 
  }
  get correoRegValido() { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registroData.correo); }
  get telefonoValido() { return this.registroData.telefono.length === 10; }
  get passValida() { return this.registroData.password.length >= 6; }
  get passCoinciden() { return this.passValida && this.registroData.password === this.registroData.confirmarPassword; }
  get calleValida() { return this.registroData.calle.trim().length >= 4; }
  get cpValido() { return this.registroData.cp.length === 5; }
  get coloniaValida() { return this.registroData.colonia.trim().length >= 3; }

  get formularioRegistroValido() {
    return this.nombreValido && this.correoRegValido && this.telefonoValido && 
           this.passCoinciden && this.calleValida && this.cpValido && this.coloniaValida;
  }

  get correoLogValido() { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.loginData.correo); }
  get passLogValida() { return this.loginData.password.length >= 6; }

  registrarCliente() {
    this.intentoRegistro = true;

    if (this.formularioRegistroValido) {
      this.authService.registrarCliente(this.registroData).subscribe({
        next: (respuesta: any) => {
          this.mensajeModal = respuesta.mensaje; 
          this.mostrarModalExito = true;
          setTimeout(() => this.cambiarVista('login'), 2000); 
        },
        error: (error: any) => {
          this.mensajeModal = error.error?.mensaje || "Error al conectar con el servidor.";
          this.mostrarModalError = true;
        }
      });
    } else {
      this.mensajeModal = "Por favor, corrige los campos marcados en rojo.";
      this.mostrarModalError = true;
    }
  }

  iniciarSesion() {
    this.intentoLogin = true;

    if (this.correoLogValido && this.passLogValida) {
      this.authService.iniciarSesion(this.loginData).subscribe({
        next: (respuesta: any) => {
          // 1. Guardamos el Token
          this.authService.guardarToken(respuesta.token);
          
          // 2. 🚩 GUARDAMOS EL ID DEL CLIENTE PARA SU PERFIL
          localStorage.setItem('cliente_id', respuesta.cliente.id); 

          // 3. Mostramos mensaje de éxito
          this.mensajeModal = respuesta.mensaje;
          this.mostrarModalExito = true;

          // 4. 🚩 LO MANDAMOS A SU NUEVO PANEL DE PERFIL
          setTimeout(() => {
            this.router.navigate(['/perfil']); 
          }, 2000);
        },
        error: (error: any) => {
          this.mensajeModal = error.error?.mensaje || "Error al conectar con el servidor.";
          this.mostrarModalError = true;
        }
      });
    } else {
      this.mensajeModal = "Verifica tu correo o contraseña.";
      this.mostrarModalError = true;
    }
  }

  loginConGoogle() {
    this.mensajeModal = "Próximamente: Inicio de sesión con Google estará disponible.";
    this.mostrarModalExito = false; 
    this.mostrarModalError = true; 
  }

  recuperarPassword() {
    this.intentoRecuperar = true;
  }

  cerrarModales() {
    this.mostrarModalError = false; this.mostrarModalExito = false; this.mostrarModalRecuperar = false;
  }
}