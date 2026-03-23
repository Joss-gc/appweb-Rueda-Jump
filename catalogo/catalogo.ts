import { Component, OnInit, Injectable, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ClienteService } from '../../admin/services/cliente.service'; 

declare var bootstrap: any;

@Injectable({ providedIn: 'root' })
export class EquipoService {
  private apiUrl = 'http://127.0.0.1:3000/api/equipos';
  constructor(private http: HttpClient) { }
  getEquipos(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
}

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private apiUrl = 'http://127.0.0.1:3000/api/reservas';
  constructor(private http: HttpClient) { }
  agregarReserva(reserva: any): Observable<any> { return this.http.post(this.apiUrl, reserva); }
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  categoriaActiva = 'Todos';
  terminoBusqueda = '';
  cargando = true;

  mostrarModal = false;
  productoSeleccionado: any = null;

  mostrarModalReserva: boolean = false;
  
  solicitud: any = { 
    nombreCliente: '', 
    telefono: '', 
    direccion: '', 
    colonia: '',   
    cp: '',        
    equipo: '', 
    fechaEvento: '', 
    hora: '' 
  };
  
  intentoEnvio: boolean = false;
  enviandoReserva: boolean = false;
  minDate: string = new Date().toISOString().split('T')[0];
  maxDate: string = '2026-12-31';

  sesionIniciada: boolean = false;
  datosPerfil: any = null;

  constructor(
    private route: ActivatedRoute,
    private equipoService: EquipoService,
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.cargarDatos(); 
    this.verificarSesion();
  }

  cargarDatos() {
    this.equipoService.getEquipos().subscribe({
      next: (res: any) => {
        this.productos = res;
        this.productosFiltrados = [...this.productos];
        this.cargando = false;
        this.cdr.detectChanges(); 
        this.revisarUrl();
      },
      error: () => { this.cargando = false; this.cdr.detectChanges(); }
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
      if (this.datosPerfil.direccion) {
         this.solicitud.direccion = this.datosPerfil.direccion.calle || '';
         this.solicitud.colonia = this.datosPerfil.direccion.colonia || '';
         this.solicitud.cp = this.datosPerfil.direccion.cp || '';
      }
    }
  }

  revisarUrl() {
    this.route.queryParams.subscribe(p => {
      if (p['abrir']) {
        const encontrado = this.productos.find(i => i._id === p['abrir']);
        if (encontrado) this.abrirModal(encontrado);
      }
    });
  }

  filtrar(cat: string) { this.categoriaActiva = cat; this.aplicarFiltros(); }
  buscar() { this.aplicarFiltros(); }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter(p => {
      const matchCat = this.categoriaActiva === 'Todos' || p.categoria === this.categoriaActiva;
      const matchBus = p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      return matchCat && matchBus;
    });
    this.cdr.detectChanges();
  }

  abrirModal(p: any) { this.productoSeleccionado = p; this.mostrarModal = true; }
  cerrarModal() { this.mostrarModal = false; }

  abrirReservaRapida() {
    this.solicitud.equipo = this.productoSeleccionado.nombre;
    this.poblarSolicitudConSesion(); 
    this.intentoEnvio = false; 
    this.mostrarModal = false; 
    this.mostrarModalReserva = true; 
  }

  cerrarModalReserva() {
    this.mostrarModalReserva = false;
    this.productoSeleccionado = null; // 🚩 Limpiamos el producto seleccionado
    
    this.solicitud.equipo = '';
    this.solicitud.fechaEvento = '';
    this.solicitud.hora = '';
    if (!this.sesionIniciada) {
       this.solicitud.nombreCliente = '';
       this.solicitud.telefono = '';
       this.solicitud.direccion = '';
       this.solicitud.colonia = '';
       this.solicitud.cp = '';
    }
    
    this.intentoEnvio = false;
    this.enviandoReserva = false; // 🚩 Apagamos el botón giratorio
    this.cdr.detectChanges(); 
  }

  soloNumeros(event: any) {
    if (!/[0-9]/.test(event.key)) event.preventDefault();
  }

  get nombreValido() { return !!this.solicitud.nombreCliente && this.solicitud.nombreCliente.trim().length >= 3 && this.solicitud.nombreCliente.trim().length <= 50; }
  get telefonoValido() { return !!this.solicitud.telefono && /^\d{10}$/.test(this.solicitud.telefono); }
  get calleValida() { return !!this.solicitud.direccion && this.solicitud.direccion.trim().length >= 5; }
  get coloniaValida() { return !!this.solicitud.colonia && this.solicitud.colonia.trim().length >= 3; }
  get cpValido() { return !!this.solicitud.cp && /^\d{5}$/.test(this.solicitud.cp); }
  get fechaValida() { return !!this.solicitud.fechaEvento && this.solicitud.fechaEvento !== ''; }
  get horaValida() { 
    if (!this.solicitud.hora) return false;
    return this.solicitud.hora >= '09:00' && this.solicitud.hora <= '21:00';
  }

  get formValido() { return this.nombreValido && this.telefonoValido && this.calleValida && this.coloniaValida && this.cpValido && this.fechaValida && this.horaValida; }

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
        error: () => {
          this.enviandoReserva = false; 
          this.mostrarError(); 
        }
      });
    } else {
      this.mostrarError(); 
    }
  }

  mostrarExito() { 
    // 🚩 Primero apagamos el estado de envío para que el botón descanse
    this.enviandoReserva = false; 
    this.cdr.detectChanges();

    const modalExitoElem = document.getElementById('modalExitoReservaCat');
    if (modalExitoElem) {
       const modal = new bootstrap.Modal(modalExitoElem);
       modal.show();
       
       // 🚩 Al cerrar el modal de éxito, cerramos el formulario de atrás
       modalExitoElem.addEventListener('hidden.bs.modal', () => {
           this.cerrarModalReserva();
       }, { once: true }); 
    } else {
       this.cerrarModalReserva();
    }
  }

  mostrarError() { 
    new bootstrap.Modal(document.getElementById('modalErrorReservaCat')).show(); 
  }
}