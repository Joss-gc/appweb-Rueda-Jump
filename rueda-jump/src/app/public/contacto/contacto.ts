import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar'; 
import { Footer } from '../../shared/footer/footer'
@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {
  nombre: string = '';
  telefono: string = '';
  mensaje: string = '';

  mostrarAdvertencia: boolean = false;
  mostrarMensajeExito: boolean = false;

  enviarMensaje(event: Event) {
    event.preventDefault(); 

    if (!this.nombre.trim() || !this.telefono.trim() || !this.mensaje.trim()) {
      this.mostrarAdvertencia = true;
      return;
    }

    this.mostrarMensajeExito = true;
  }

  cerrarModales() {
    this.mostrarAdvertencia = false;
    this.mostrarMensajeExito = false;
    
    if (!this.mostrarAdvertencia) {
      this.nombre = '';
      this.telefono = '';
      this.mensaje = '';
    }
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
}