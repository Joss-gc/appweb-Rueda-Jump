import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { ClienteService } from '../../admin/services/cliente.service';
import { ReservaService } from '../../admin/services/reserva.service';
import { EquipoService } from '../../admin/services/equipos.service'; 

declare var bootstrap: any;

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {

  miPerfil: any = null;
  misReservas: any[] = []; 
  
  cargando: boolean = true;
  mensajeError: string = '';

  mostrarModalEditar: boolean = false;
  datosEditados: any = {};
  fotoSeleccionada: File | null = null;
  enviandoCambios: boolean = false;
  fotoTimestamp: number = Date.now();
  subiendoPagoId: string | null = null;
  tituloExito: string = '';
  mensajeExito: string = '';

  constructor(
    private clienteService: ClienteService,
    private reservaService: ReservaService,
    private equipoService: EquipoService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargarMiInformacion(); }

  cargarMiInformacion() {
    const clienteId = localStorage.getItem('cliente_id');
    if (!clienteId) { this.router.navigate(['/login']); return; }

    this.cargando = true;
    this.mensajeError = '';

    this.clienteService.getClientePorId(clienteId).subscribe({
      next: (datosBD: any) => { 
        this.miPerfil = datosBD;
        
        this.equipoService.getEquipos().subscribe(equiposBase => {
          this.reservaService.getReservas().subscribe({
            next: (todasLasReservas: any[]) => {
              let misRes = todasLasReservas.filter(r => r.telefono === this.miPerfil.telefono);
              
              misRes = misRes.map(r => {
                if (!r.precio || r.precio === 0) {
                  const equipoInfo = equiposBase.find(e => e.nombre === r.equipo);
                  r.precio = equipoInfo ? equipoInfo.precio : 0;
                }
                return r;
              });
              
              this.misReservas = misRes.sort((a, b) => new Date(b.fechaCreacion || b.fechaEvento).getTime() - new Date(a.fechaCreacion || a.fechaEvento).getTime());
              this.cargando = false;
              this.subiendoPagoId = null; 
              this.cdr.detectChanges(); 
            },
            error: () => {
              this.misReservas = [];
              this.cargando = false;
              this.subiendoPagoId = null;
              this.cdr.detectChanges();
            }
          });
        });
      },
      error: () => { 
        this.mensajeError = "No pudimos cargar tu perfil.";
        this.cargando = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  getFotoUrl(): string {
    if (!this.miPerfil || !this.miPerfil.fotoUrl) return '';
    if (this.miPerfil.fotoUrl.startsWith('http')) return `${this.miPerfil.fotoUrl.split('?')[0]}?t=${this.fotoTimestamp}`;
    return `http://127.0.0.1:3000${this.miPerfil.fotoUrl}?t=${this.fotoTimestamp}`;
  }

  abrirModal() {
    this.fotoSeleccionada = null;
    this.datosEditados = JSON.parse(JSON.stringify(this.miPerfil));
    if (!this.datosEditados.direccion) this.datosEditados.direccion = { calle: '', cp: '', colonia: '', referencias: '' };
    this.mostrarModalEditar = true;
  }

  onFotoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoSeleccionada = file;
      this.enviandoCambios = true;
      this.clienteService.actualizarCliente(this.miPerfil._id, this.miPerfil, this.fotoSeleccionada || undefined).subscribe({
        next: (res: any) => {
          this.miPerfil = res; 
          this.fotoTimestamp = Date.now(); 
          this.enviandoCambios = false;
          this.fotoSeleccionada = null;
          this.cdr.detectChanges();
          this.abrirModalExito('¡Foto Actualizada!', 'Tu nueva imagen se guardó correctamente.');
        },
        error: () => { this.enviandoCambios = false; this.cdr.detectChanges(); }
      });
    }
  }

  guardarCambios() {
    this.enviandoCambios = true;
    this.clienteService.actualizarCliente(this.miPerfil._id, this.datosEditados, this.fotoSeleccionada || undefined).subscribe({
        next: (clienteFresco: any) => { 
            this.miPerfil = clienteFresco;
            this.mostrarModalEditar = false; 
            this.enviandoCambios = false;
            this.cdr.detectChanges(); 
            this.abrirModalExito('¡Datos Guardados!', 'Tu información se actualizó con éxito.');
        },
        error: () => { this.enviandoCambios = false; this.cdr.detectChanges(); }
    });
  }

  onPagoSelected(event: any, idReserva: string) {
    const file = event.target.files[0];
    if (!file) return;
    this.subiendoPagoId = idReserva; 
    this.cdr.detectChanges();
    this.reservaService.subirComprobantePago(idReserva, file).subscribe({
      next: () => {
        this.subiendoPagoId = null;
        event.target.value = ''; 
        this.cargarMiInformacion(); 
        this.abrirModalExito('¡Pago Enviado!', 'El administrador revisará tu comprobante muy pronto.');
      },
      error: () => {
        this.subiendoPagoId = null; 
        event.target.value = ''; 
        this.cdr.detectChanges();
        alert("Error al subir el comprobante.");
      }
    });
  }

  abrirModalExito(titulo: string, mensaje: string) {
    this.tituloExito = titulo;
    this.mensajeExito = mensaje;
    const modalElement = document.getElementById('modalExitoPerfil');
    if (modalElement) new bootstrap.Modal(modalElement).show();
  }

  cerrarSesion() {
    localStorage.removeItem('token_rueda_jump');
    localStorage.removeItem('cliente_id');
    this.router.navigate(['/login']);
  }

  // 🚩 RECONOCE TODOS LOS ESTADOS
  esRentaActiva(estado: string): boolean {
    const activos = ['Aprobado', 'Confirmado', 'Preparando', 'En Camino', 'Instalado', 'Recolectado', 'Finalizado'];
    return activos.includes(estado);
  }

  // 🚩 FUNCIÓN BLINDADA
  getNivelProgreso(estado: string): number {
    if (estado === 'Aprobado' || estado === 'Confirmado') return 1;
    if (estado === 'Preparando') return 2;
    if (estado === 'En Camino') return 3;
    if (estado === 'Instalado') return 4;
    if (estado === 'Recolectado' || estado === 'Finalizado') return 5;
    return 1; 
  }
}