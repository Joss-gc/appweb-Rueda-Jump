import { Component, OnInit, Injectable, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs'; 

import { ClienteService } from '../../admin/services/cliente.service'; 

declare var bootstrap: any; 

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private apiUrl = 'http://127.0.0.1:3000/api/reservas';
  constructor(private http: HttpClient) { }
  agregarReserva(reserva: any): Observable<any> { return this.http.post(this.apiUrl, reserva); }
}

@Injectable({ providedIn: 'root' })
export class EquipoService {
  private apiUrl = 'http://127.0.0.1:3000/api/equipos'; 
  constructor(private http: HttpClient) { }
  getEquipos(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit { 

  productosDestacados: any[] = []; 
  mensajeAsesor: string = '';
  numeroEmpresa: string = '7710000000'; 
  cargando: boolean = true; 

  mostrarModalReserva: boolean = false;
  productoSeleccionado: any = null;
  solicitud: any = { nombreCliente: '', telefono: '', direccion: '', equipo: '', fechaEvento: '', hora: '' };
  enviandoReserva: boolean = false;
  intentoEnvio: boolean = false; 
  minDate: string = new Date().toISOString().split('T')[0];
  maxDate: string = '2026-12-31';

  sesionIniciada: boolean = false;
  datosPerfil: any = null; 

  constructor(
    private router: Router,
    private equipoService: EquipoService,
    private reservaService: ReservaService, 
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarEquipos();
    this.verificarSesion(); 
  }

  cargarEquipos() {
    this.equipoService.getEquipos().subscribe({
      next: (data: any[]) => {
        this.productosDestacados = data.filter(equipo => equipo.destacado === true || equipo.destacado === 'true');
        this.cargando = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  verificarSesion() {
    const clienteId = localStorage.getItem('cliente_id');
    if (clienteId) {
      this.sesionIniciada = true;
      this.clienteService.getClientePorId(clienteId).subscribe({
        next: (perfil: any) => {
          this.datosPerfil = perfil;
          this.poblarSolicitudConSesion();
          this.cdr.detectChanges();
        }
      });
    }
  }

  poblarSolicitudConSesion() {
    if (this.sesionIniciada && this.datosPerfil) {
      this.solicitud.nombreCliente = this.datosPerfil.nombre || '';
      this.solicitud.telefono = this.datosPerfil.telefono || '';
      if (this.datosPerfil.direccion && this.datosPerfil.direccion.calle) {
         this.solicitud.direccion = this.datosPerfil.direccion.calle;
      }
    }
  }

  abrirModalAsesor() {
    this.mensajeAsesor = 'Hola, me gustaría recibir asesoría sobre la renta de inflables para mi evento.';
  }

  enviarMensajeAsesor() {
    if (this.mensajeAsesor.trim() !== '') {
      const url = `https://wa.me/52${this.numeroEmpresa}?text=${encodeURIComponent(this.mensajeAsesor)}`;
      window.open(url, '_blank');
    }
  }

  abrirReservaRapida(producto: any) {
    this.productoSeleccionado = producto;
    this.solicitud.equipo = producto.nombre;
    this.poblarSolicitudConSesion(); 
    this.intentoEnvio = false; 
    this.mostrarModalReserva = true;
  }

  cerrarModalReserva() {
    this.mostrarModalReserva = false;
    this.productoSeleccionado = null;
    
    this.solicitud.equipo = '';
    this.solicitud.fechaEvento = '';
    this.solicitud.hora = '';
    if (!this.sesionIniciada) {
       this.solicitud.nombreCliente = '';
       this.solicitud.telefono = '';
       this.solicitud.direccion = '';
    }
    
    this.intentoEnvio = false;
    this.enviandoReserva = false; 
    this.cdr.detectChanges(); 
  }

  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) event.preventDefault();
  }

  get nombreValido() { 
    return !!this.solicitud.nombreCliente && this.solicitud.nombreCliente.trim().length >= 3 && this.solicitud.nombreCliente.trim().length <= 25; 
  }
  get telefonoValido() { 
    return !!this.solicitud.telefono && /^\d{10}$/.test(this.solicitud.telefono); 
  }
  get direccionValida() { 
    return !!this.solicitud.direccion && this.solicitud.direccion.trim().length >= 10; 
  }
  get fechaValida() { 
    return !!this.solicitud.fechaEvento && this.solicitud.fechaEvento !== ''; 
  }
  get horaValida() { 
    if (!this.solicitud.hora) return false;
    return this.solicitud.hora >= '09:00' && this.solicitud.hora <= '21:00';
  }

  get formValido() {
    return this.nombreValido && this.telefonoValido && this.direccionValida && this.fechaValida && this.horaValida;
  }

  enviarSolicitudReserva() {
    this.intentoEnvio = true;
    this.cdr.detectChanges(); 

    if (this.formValido) {
      this.enviandoReserva = true;
      this.solicitud.estado = 'Pendiente'; 
      
      this.reservaService.agregarReserva(this.solicitud).subscribe({
        next: () => {
          this.mostrarExito(); 
        },
        error: (err) => {
          console.error(err);
          this.enviandoReserva = false; 
          this.mostrarError(); 
        }
      });
    } else {
      this.mostrarError(); 
    }
  }

  // 🚩 CIERRE DE MODAL MEJORADO
  mostrarExito() { 
    const modalExitoElem = document.getElementById('modalExitoReservaHome');
    if (modalExitoElem) {
       const modal = new bootstrap.Modal(modalExitoElem);
       modal.show();
       modalExitoElem.addEventListener('hidden.bs.modal', () => {
           this.cerrarModalReserva();
       }, { once: true }); 
    }
  }
  
  mostrarError() { 
    new bootstrap.Modal(document.getElementById('modalErrorReservaHome')).show(); 
  }

  irYAbrirCatalogo(idProducto: string) {
    this.router.navigate(['/catalogo'], { queryParams: { abrir: idProducto } });
  }
}