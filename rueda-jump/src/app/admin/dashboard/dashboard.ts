import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
// 🚩 Importamos los 3 servicios
import { EquipoService } from '../services/equipos.service';
import { ClienteService } from '../services/cliente.service';
import { ReservaService } from '../services/reserva.service';

declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {

  // Variables para KPIS
  ingresosMes: number = 0;
  equiposRentados: number = 0;
  totalEquipos: number = 0;
  nuevosClientes: number = 0;
  solicitudesPendientesCount: number = 0;
  
  proximasRentas: any[] = [];

  // Formulario Nueva Reserva
  nuevaReserva: any = { cliente: '', tel: '', equipo: '', fecha: '', hora: '', estado: 'Aprobado' };
  intentoEnvio: boolean = false;
  minDate: string = new Date().toISOString().split('T')[0];
  maxDate: string = '2026-12-31';

  constructor(
    private equipoService: EquipoService,
    private clienteService: ClienteService,
    private reservaService: ReservaService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    // 1. Obtener Total de Equipos
    this.equipoService.getEquipos().subscribe(data => {
      this.totalEquipos = data.length;
    });

    // 2. Obtener Clientes Nuevos (de este mes)
    this.clienteService.getClientes().subscribe(data => {
      this.nuevosClientes = data.length;
    });

    // 3. Procesar Reservas para Ingresos, Rentas Activas y Próximas Entregas
    this.reservaService.getReservas().subscribe(data => {
      // Filtrar pendientes para el badge del botón azul
      this.solicitudesPendientesCount = data.filter(r => r.estado === 'Pendiente').length;

      // Filtrar aprobadas para el calendario y KPIS
      const aprobadas = data.filter(r => r.estado === 'Aprobado');
      
      this.equiposRentados = aprobadas.length; 
      
      // Cálculo de ingresos (Simulado: supongamos que cada renta promedia $800)
      this.ingresosMes = aprobadas.length * 800;

      // Próximas 5 entregas (ordenadas por fecha)
      this.proximasRentas = aprobadas
        .slice(0, 5)
        .map(r => ({
          cliente: r.cliente,
          equipo: r.equipo,
          fecha: r.fecha,
          estado: 'Confirmado',
          color: 'success'
        }));
    });
  }

  // --- Lógica del Formulario de Renta Manual ---

  get nombreValido() { return this.nuevaReserva.cliente.length >= 3; }
  get telefonoValido() { return /^\d{10}$/.test(this.nuevaReserva.tel); }
  get equipoValido() { return this.nuevaReserva.equipo !== ''; }
  get fechaValida() { return this.nuevaReserva.fecha !== ''; }
  get horaValida() { return this.nuevaReserva.hora !== ''; }

  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) event.preventDefault();
  }

  guardarReserva() {
    this.intentoEnvio = true;
    if (this.nombreValido && this.telefonoValido && this.equipoValido && this.fechaValida && this.horaValida) {
      
      // Enviamos a MongoDB
      this.reservaService.agregarReserva(this.nuevaReserva).subscribe({
        next: () => {
          this.cerrarModal('modalNuevaReserva');
          this.mostrarExito();
          this.cargarEstadisticas(); // Refrescar números
          this.nuevaReserva = { cliente: '', tel: '', equipo: '', fecha: '', hora: '', estado: 'Aprobado' };
          this.intentoEnvio = false;
        },
        error: () => alert('Error al guardar la reserva manual')
      });

    } else {
      this.abrirModalError();
    }
  }

  // --- Helpers de UI ---

  cerrarModal(id: string) {
    const modalElem = document.getElementById(id);
    if (modalElem) {
      const modal = bootstrap.Modal.getInstance(modalElem) || new bootstrap.Modal(modalElem);
      modal.hide();
    }
  }

  mostrarExito() {
    const modal = new bootstrap.Modal(document.getElementById('modalExitoReserva'));
    modal.show();
  }

  abrirModalError() {
    const modal = new bootstrap.Modal(document.getElementById('modalErrorReserva'));
    modal.show();
  }

  get porcentajeOcupacion() {
    if (this.totalEquipos === 0) return 0;
    return Math.round((this.equiposRentados / this.totalEquipos) * 100);
  }
}