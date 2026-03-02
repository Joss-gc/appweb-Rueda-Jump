import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-admin.html',
  styleUrl: './registro-admin.css'
})
export class RegistroAdmin {
  nombre = '';
  usuario = '';
  password = '';
  codigoSecreto = '';
  mensajeError = '';
  mostrarMensajeExito = false;

  readonly CODIGO_MAESTRO = 'RUEDA-ADMIN-2026';

  constructor(private router: Router) {}

  registrar(event: Event) {
    event.preventDefault();

    if (this.codigoSecreto !== this.CODIGO_MAESTRO) {
      this.mensajeError = 'Código de autorización incorrecto.';
      return;
    }

    const nuevoAdmin = {
      nombre: this.nombre,
      usuario: this.usuario,
      password: this.password
    };
    
    localStorage.setItem('rueda_admin_data', JSON.stringify(nuevoAdmin));
    localStorage.setItem('admin_logged_in', 'true');
    
    this.mensajeError = '';
    this.mostrarMensajeExito = true; 
  }

  irAlDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }
}