import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🚩 Agregamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../services/reserva.service';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './calendario.html'
})
export class Calendario implements OnInit {

  mesActual: Date = new Date();
  nombreMes: string = '';
  anioVisible: number = 0;
  diasCalendario: any[] = [];
  
  reservasAprobadas: any[] = [];
  detalle: any = null;
  mensajeWhatsApp: string = '';

  constructor(
    private reservaService: ReservaService,
    private cdr: ChangeDetectorRef // 🚩 Para asegurar que los datos se vean rápido
  ) {}

  ngOnInit() {
    this.cargarReservas();
    this.renderizarCalendario();
  }

  cargarReservas() {
    this.reservaService.getReservas().subscribe({
      next: (data) => {
        // 🚩 Filtramos solo las aprobadas
        this.reservasAprobadas = data.filter(r => r.estado === 'Aprobado');
        console.log('📅 Reservas en calendario:', this.reservasAprobadas);
        this.renderizarCalendario(); // Re-renderizamos cuando llegan los datos
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error en calendario', err)
    });
  }

  renderizarCalendario() {
    const anio = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();
    this.anioVisible = anio;
    this.nombreMes = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(this.mesActual);

    const primerDiaMes = new Date(anio, mes, 1).getDay();
    const ultimoDiaMes = new Date(anio, mes + 1, 0).getDate();
    const hoy = new Date();

    this.diasCalendario = [];

    for (let i = 0; i < primerDiaMes; i++) {
      this.diasCalendario.push({ numero: null });
    }

    for (let i = 1; i <= ultimoDiaMes; i++) {
      const fechaIterada = `${anio}-${(mes + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      this.diasCalendario.push({
        numero: i,
        fechaCompleta: fechaIterada,
        esHoy: hoy.getDate() === i && hoy.getMonth() === mes && hoy.getFullYear() === anio
      });
    }
  }

  // 🚩 CORRECCIÓN: Buscamos por 'fechaEvento'
  obtenerReserva(dia: number | null) {
    if (!dia) return null;
    const fechaBuscada = `${this.anioVisible}-${(this.mesActual.getMonth() + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    return this.reservasAprobadas.find(r => r.fechaEvento === fechaBuscada);
  }

  ver(dia: number | null) {
    const renta = this.obtenerReserva(dia);
    if (renta) {
      this.detalle = { ...renta, dia };
      this.prepararMensaje(); // Preparamos el mensaje de una vez
    } else {
      this.detalle = null;
    }
  }

  cambiarMes(dir: number) {
    this.mesActual.setMonth(this.mesActual.getMonth() + dir);
    this.renderizarCalendario();
  }

  irAHoy() {
    this.mesActual = new Date();
    this.renderizarCalendario();
  }

  prepararMensaje() {
    if (this.detalle) {
      // 🚩 CORRECCIÓN: Usamos 'nombreCliente' y 'equipo'
      this.mensajeWhatsApp = `¡Hola ${this.detalle.nombreCliente}! Te contacto de Rueda Jump para confirmar la entrega de tu equipo ${this.detalle.equipo} el día de hoy. 🎪`;
    }
  }

  enviarWhatsApp() {
    if (this.detalle) {
      // 🚩 CORRECCIÓN: Usamos 'telefono'
      const numero = '52' + this.detalle.telefono;
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(this.mensajeWhatsApp)}`, '_blank');
    }
  }
}