import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../services/reserva.service';
import { EquipoService } from '../services/equipos.service'; // 🚩 IMPORTAMOS EL SERVICIO DE EQUIPOS

declare var bootstrap: any;

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './solicitudes.html'
})
export class Solicitudes implements OnInit {

  reservas: any[] = [];
  reservasMostradas: any[] = [];
  solicitudesPendientes: any[] = [];
  pagosEnRevision: any[] = []; 
  solicitudesProcesadas: any[] = [];
  
  pestanaActiva: string = 'nuevas';
  terminoBusqueda: string = '';
  cargando: boolean = true;
  
  solicitudSeleccionada: any = null;
  mensajeWA: string = '';

  constructor(
    private reservaService: ReservaService, 
    private equipoService: EquipoService, // 🚩 LO INYECTAMOS AQUÍ
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.cargarSolicitudes(); 
  }

  cargarSolicitudes() {
    this.cargando = true;
    
    // 🚩 PRIMERO CARGAMOS LOS EQUIPOS PARA SABER LOS PRECIOS REALES
    this.equipoService.getEquipos().subscribe(equiposBase => {
      this.reservaService.getReservas().subscribe({
        next: (data: any[]) => {
          
          // 🚩 MAGIA: Si la reserva no trae precio (porque es vieja), buscamos el precio real en el catálogo
          const reservasConPrecioReal = data.map(r => {
            if (!r.precio || r.precio === 0) {
               const equipoInfo = equiposBase.find(e => e.nombre === r.equipo);
               r.precio = equipoInfo ? equipoInfo.precio : 0;
            }
            return r;
          });

          this.reservas = reservasConPrecioReal.sort((a, b) => new Date(b.fechaCreacion || b.fechaEvento).getTime() - new Date(a.fechaCreacion || a.fechaEvento).getTime());
          
          this.solicitudesPendientes = this.reservas.filter(s => s.estado === 'Pendiente');
          this.pagosEnRevision = this.reservas.filter(s => (s.estado === 'Aprobado' || s.estado === 'Confirmado') && s.estadoPago !== 'Pagado');
          this.solicitudesProcesadas = this.reservas.filter(s => s.estadoPago === 'Pagado' || s.estado === 'Rechazado' || s.estado === 'Cancelado');
          
          this.filtrarLista(); 
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  cambiarPestana(pestana: string) {
    this.pestanaActiva = pestana;
    this.terminoBusqueda = ''; 
    this.filtrarLista();
  }

  filtrarLista() {
    let listaFiltrada = [];
    if (this.pestanaActiva === 'nuevas') listaFiltrada = this.solicitudesPendientes;
    else if (this.pestanaActiva === 'pagos') listaFiltrada = this.pagosEnRevision;
    else listaFiltrada = this.solicitudesProcesadas;

    if (this.terminoBusqueda.trim() !== '') {
      const term = this.terminoBusqueda.toLowerCase();
      listaFiltrada = listaFiltrada.filter(r => 
        (r.nombreCliente && r.nombreCliente.toLowerCase().includes(term)) || 
        (r.telefono && r.telefono.includes(term))
      );
    }
    this.reservasMostradas = listaFiltrada;
    this.cdr.detectChanges();
  }

  prepararAccion(solicitud: any, tipo: string) {
    this.solicitudSeleccionada = { ...solicitud, estadoTemporal: tipo };
    this.mensajeWA = tipo === 'Aprobar' ? 
      `¡Hola ${solicitud.nombreCliente}! Tu renta de ${solicitud.equipo} ha sido aprobada. 🎪 Por favor sube tu pago en el perfil de la web o envíamelo por aquí para confirmarla al 100%.` : 
      `Hola ${solicitud.nombreCliente}, lamentablemente no tenemos disponibilidad de equipo para esa fecha.`;
  }
  
  prepararAccionPago(solicitud: any) { this.solicitudSeleccionada = solicitud; }
  verComprobante(solicitud: any) { this.solicitudSeleccionada = solicitud; }
  esImagen(url: string | undefined): boolean { return url ? url.match(/\.(jpeg|jpg|gif|png)$/) != null : false; }

  confirmarAccion(nuevoEstado: string) {
    if (!this.solicitudSeleccionada) return;
    this.reservaService.actualizarEstado(this.solicitudSeleccionada._id, nuevoEstado).subscribe({
      next: () => {
        const numero = '52' + this.solicitudSeleccionada.telefono;
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(this.mensajeWA)}`, '_blank');
        this.limpiarPantallaYRefrescar();
      }
    });
  }

  acreditarPago() { this.aprobarPago(); }

  aprobarPago() {
    if (!this.solicitudSeleccionada) return;
    this.reservaService.actualizarReservaCompleta(this.solicitudSeleccionada._id, { estadoPago: 'Pagado' })
      .subscribe({
        next: () => {
          this.limpiarPantallaYRefrescar();
          setTimeout(() => {
            const modalElement = document.getElementById('modalExitoAdmin');
            if (modalElement) new bootstrap.Modal(modalElement).show();
          }, 400);
        },
        error: () => {
          alert("Error: Asegúrate de que el Backend permite actualizar el estadoPago.");
          this.limpiarPantallaYRefrescar();
        }
      });
  }

  limpiarPantallaYRefrescar() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(m => { const ins = bootstrap.Modal.getInstance(m); if (ins) ins.hide(); });
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    this.cargarSolicitudes();
  }

  onPagoAdminSelected(event: any, idReserva: string) {
    const file = event.target.files[0];
    if (file) {
      event.target.value = ''; 
      this.reservaService.subirComprobantePago(idReserva, file).subscribe(() => this.cargarSolicitudes());
    }
  }
}