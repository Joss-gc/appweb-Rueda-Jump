import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // <-- Agregado para poder ir al Checkout
import { Navbar } from '../../shared/navbar/navbar'; 
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Footer], // <-- Registramos el RouterModule
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  
  // --- AÑADIMOS EL CATÁLOGO DE PRODUCTOS ---
  // Esto alimenta las tarjetas del HTML automáticamente
  productos = [
    { nombre: 'Toro Mecánico Deluxe', categoria: 'Mecánicos', precio: '2,500.00', medidas: '5x5 metros' },
    { nombre: 'Deslizador Acuático', categoria: 'Acuáticos', precio: '1,800.00', medidas: '10x3 metros' },
    { nombre: 'Castillo Princesas', categoria: 'Niñas', precio: '1,200.00', medidas: '4x4 metros' },
    { nombre: 'Escaladora Extrema', categoria: 'Interactivos', precio: '1,500.00', medidas: '6x4 metros' },
    { nombre: 'Cuartel Unicornio', categoria: 'Niñas', precio: '1,500.00', medidas: '4.5x5 metros' },
    { nombre: 'Ring de Box', categoria: 'Deportivos', precio: '1,300.00', medidas: '5x5 metros' }
  ];

  // --- TUS VARIABLES ORIGINALES (INTACTAS) ---
  mostrarModal = false;
  mostrarMensajeExito = false;
  productoSeleccionado: any = {};
  fechaMinima: string = '';
  fechaSeleccionada: string = '';

  ngOnInit() {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaSeleccionada = this.fechaMinima;
  }

  // Se conservan tus funciones originales para no romper tu lógica
  abrirModal(nombre: string, precio: string, medidas: string) {
    this.productoSeleccionado = { nombre, precio, medidas };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  confirmarReserva() {
    this.mostrarModal = false;
    this.mostrarMensajeExito = true;
  }

  cerrarTodo() {
    this.mostrarMensajeExito = false;
    this.mostrarModal = false;
  }
}