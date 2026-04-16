import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // <-- IMPORTA Router
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  // Productos destacados (Añade IDs que coincidan con los del catálogo)
  productosDestacados = [
    { id: 'toro-deluxe', nombre: 'Toro Mecánico Deluxe', precio: '2,500.00', categoria: 'Mecánicos', img: 'bi-bullseye' },
    { id: 'castillo-princesas', nombre: 'Castillo Princesas', precio: '1,200.00', categoria: 'Infantil', img: 'bi-stars' },
    { id: 'deslizador-acuatico', nombre: 'Deslizador Acuático', precio: '1,800.00', categoria: 'Acuáticos', img: 'bi-water' }
  ];

  mensajeAsesor: string = '';
  numeroEmpresa: string = '7710000000'; 

  // Inyectamos el Router
  constructor(private router: Router) {}

  abrirModalAsesor() {
    this.mensajeAsesor = 'Hola, me gustaría recibir asesoría sobre la renta de inflables para mi evento.';
  }

  enviarMensajeAsesor() {
    if (this.mensajeAsesor.trim() !== '') {
      const url = `https://wa.me/52${this.numeroEmpresa}?text=${encodeURIComponent(this.mensajeAsesor)}`;
      window.open(url, '_blank');
    }
  }

  // NUEVA FUNCIÓN: Lleva al catálogo y le dice qué ID abrir
  irYAbrirCatalogo(idProducto: string) {
    this.router.navigate(['/catalogo'], { queryParams: { abrir: idProducto } });
  }
}