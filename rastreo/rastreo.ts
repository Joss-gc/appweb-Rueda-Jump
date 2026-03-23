import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../admin/services/reserva.service';

@Component({
  selector: 'app-rastreo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rastreo.html'
})
export class Rastreo implements OnInit {

  idRastreo: string = '';
  telefonoRastreo: string = '';
  
  reservaEncontrada: any = null;
  cargando: boolean = false;
  mensajeError: string = '';

  constructor(
    private route: ActivatedRoute,
    private reservaService: ReservaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // 🚩 MAGIA: Leemos si el cliente entró por el "Link Mágico" de WhatsApp
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.idRastreo = params['id'];
        this.buscarReserva(true); // Buscamos automáticamente sin pedirle el teléfono
      }
    });
  }

  buscarReserva(desdeEnlaceMagico: boolean = false) {
    if (!this.idRastreo) {
      this.mensajeError = 'Ingresa un Folio válido.';
      return;
    }

    if (!desdeEnlaceMagico && (!this.telefonoRastreo || this.telefonoRastreo.length !== 10)) {
      this.mensajeError = 'Ingresa el número de WhatsApp de 10 dígitos con el que registraste la renta.';
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.reservaEncontrada = null;

    this.reservaService.getReservas().subscribe({
      next: (reservas: any[]) => {
        // Buscamos la reserva que coincida exactamente con el ID (Folio)
        const encontrada = reservas.find(r => r._id === this.idRastreo.trim());
        
        if (encontrada) {
          // Si NO viene del enlace mágico, verificamos que el teléfono coincida por seguridad
          if (!desdeEnlaceMagico && encontrada.telefono !== this.telefonoRastreo) {
            this.mensajeError = 'El teléfono no coincide con este folio de reserva. Intenta de nuevo.';
          } else {
            this.reservaEncontrada = encontrada;
            // Si es una reserva vieja o apenas se aprobó, le ponemos el paso 1
            if (!this.reservaEncontrada.estadoLogistico) {
               this.reservaEncontrada.estadoLogistico = 'Aprobado';
            }
          }
        } else {
          this.mensajeError = 'No encontramos ninguna reserva con ese Folio. Verifica que esté bien escrito.';
        }
        
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajeError = 'Error de conexión. Intenta más tarde.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 🚩 Lógica para saber qué paso pintar de color en la barrita de progreso
  getNivelProgreso(): number {
    const estado = this.reservaEncontrada?.estadoLogistico;
    if (estado === 'Aprobado') return 1;
    if (estado === 'Preparando') return 2;
    if (estado === 'En Camino') return 3;
    if (estado === 'Instalado') return 4;
    if (estado === 'Recolectado') return 5;
    return 0; 
  }

  limpiarBuscador() {
    this.reservaEncontrada = null;
    this.idRastreo = '';
    this.telefonoRastreo = '';
    this.mensajeError = '';
  }
}