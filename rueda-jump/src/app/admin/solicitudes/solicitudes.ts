import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../services/reserva.service';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './solicitudes.html'
})
export class Solicitudes implements OnInit {

  solicitudesPendientes: any[] = [];
  solicitudesProcesadas: any[] = [];
  
  solicitudSeleccionada: any = null;
  mensajeWA: string = '';

  constructor(private reservaService: ReservaService) {}

  ngOnInit() {
    this.cargarSolicitudes();
  }

  cargarSolicitudes() {
    this.reservaService.getReservas().subscribe({
      next: (data) => {
        // 🚩 Filtramos usando el campo 'estado' que viene de la BD
        this.solicitudesPendientes = data.filter(s => s.estado === 'Pendiente');
        this.solicitudesProcesadas = data.filter(s => s.estado !== 'Pendiente');
        console.log('Datos cargados:', data);
      },
      error: (err) => console.error('Error al cargar solicitudes', err)
    });
  }

  prepararAccion(solicitud: any, tipo: string) {
    this.solicitudSeleccionada = { ...solicitud, estadoTemporal: tipo };
    
    // 🚩 Corregido: Usamos 'nombreCliente', 'equipo' y 'fechaEvento'
    if (tipo === 'Aprobar') {
      this.mensajeWA = `¡Hola ${solicitud.nombreCliente}! Tu solicitud para rentar el equipo ${solicitud.equipo} el día ${solicitud.fechaEvento} ha sido aprobada. 🎪`;
    } else {
      this.mensajeWA = `Hola ${solicitud.nombreCliente}, lamentablemente no tenemos disponibilidad de ${solicitud.equipo} para la fecha ${solicitud.fechaEvento}.`;
    }
  }

  confirmarAccion(nuevoEstado: string) {
    if (!this.solicitudSeleccionada) return;

    this.reservaService.actualizarEstado(this.solicitudSeleccionada._id, nuevoEstado).subscribe({
      next: () => {
        // 🚩 Corregido: Usamos 'telefono' que es como se guarda en la reserva
        const numero = '52' + this.solicitudSeleccionada.telefono;
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(this.mensajeWA)}`;
        window.open(url, '_blank');
        
        this.cargarSolicitudes();
      },
      error: (err) => alert('Error al actualizar la solicitud')
    });
  }
}