import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
// 🚩 Importamos el nuevo servicio (asegúrate de que la ruta sea correcta)
import { ClienteService } from '../services/cliente.service'; 

declare var bootstrap: any;

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './clientes.html'
})
export class Clientes implements OnInit {
  
  // 🚩 Ahora empezamos sin datos inventados. ¡Vienen de Mongo!
  clientesOriginales: any[] = []; 
  clientesFiltrados: any[] = [];
  
  terminoBusqueda: string = '';
  clienteActivo: any = null;
  historial: any[] = [];
  mensajeWhatsApp: string = '';

  // 🚩 Inyectamos el servicio en el constructor
  constructor(private clienteService: ClienteService) {}

  ngOnInit() {
    this.cargarClientes();
  }

  // 🚩 Función que habla con Node.js para pedir los clientes
  cargarClientes() {
    this.clienteService.getClientes().subscribe({
      next: (data) => {
        this.clientesOriginales = data;
        this.clientesFiltrados = [...this.clientesOriginales]; // Hacemos una copia para filtrar
      },
      error: (err) => {
        console.error('Error al cargar clientes desde la base de datos', err);
      }
    });
  }

  buscar() {
    if (!this.terminoBusqueda) {
      this.clientesFiltrados = [...this.clientesOriginales];
      return;
    }
    
    const texto = this.terminoBusqueda.toLowerCase();
    this.clientesFiltrados = this.clientesOriginales.filter(c => 
      c.nombre.toLowerCase().includes(texto) || 
      c.tel.includes(texto)
    );
  }

  verHistorial(cliente: any) {
    this.clienteActivo = cliente;
    // Por ahora dejaremos un historial simulado hasta que conectemos las reservas al 100%
    this.historial = [
      { fecha: '2026-01-15', equipo: 'Toro Mecánico', estado: 'Completado' },
      { fecha: '2025-11-02', equipo: 'Castillo Princesa', estado: 'Completado' }
    ];
  }

  prepararMensaje(cliente: any) {
    this.clienteActivo = cliente;
    this.mensajeWhatsApp = `Hola ${cliente.nombre}, te saludamos de Rueda Jump 🎪. ¿En qué te podemos ayudar hoy?`;
  }

  enviarWhatsApp() {
    if (this.clienteActivo && this.clienteActivo.tel) {
      const numero = '52' + this.clienteActivo.tel; 
      const texto = encodeURIComponent(this.mensajeWhatsApp);
      const url = `https://wa.me/${numero}?text=${texto}`;
      window.open(url, '_blank');
    }
  }
}