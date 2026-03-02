import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css'
})
export class Calendario implements OnInit {
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  fechaActual = new Date();
  diasDelMes: (number | null)[] = [];
  mesNombre = '';
  anioActual = 0;

  // Rentas de ejemplo para Joel
  rentas = [
    { dia: 13, equipo: 'Toro Mecánico', estado: 'busy' },
    { dia: 14, equipo: 'Toro Mecánico', estado: 'busy' },
    { dia: 19, equipo: 'Castillo Inflable', estado: 'pending' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.generarCalendario();
  }

  generarCalendario() {
    this.anioActual = this.fechaActual.getFullYear();
    this.mesNombre = this.meses[this.fechaActual.getMonth()];
    this.diasDelMes = [];

    const primerDia = new Date(this.anioActual, this.fechaActual.getMonth(), 1).getDay();
    const ultimoDia = new Date(this.anioActual, this.fechaActual.getMonth() + 1, 0).getDate();

    const desplazamiento = primerDia === 0 ? 6 : primerDia - 1;

    for (let i = 0; i < desplazamiento; i++) this.diasDelMes.push(null);
    for (let i = 1; i <= ultimoDia; i++) this.diasDelMes.push(i);
  }

  cambiarMes(offset: number) {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + offset);
    this.generarCalendario();
  }

  obtenerRenta(dia: number | null) {
    return this.rentas.find(r => r.dia === dia);
  }
}