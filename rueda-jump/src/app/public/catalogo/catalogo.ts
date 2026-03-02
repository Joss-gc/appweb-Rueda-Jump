import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../shared/navbar/navbar'; 
import { Footer } from '../../shared/footer/footer';
@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
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