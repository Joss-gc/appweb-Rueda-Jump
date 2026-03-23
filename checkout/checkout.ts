import { Component, OnInit, Injectable, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🚩 IMPORTAMOS EL SERVICIO DE CLIENTES PARA EL AUTOCOMPLETADO
import { ClienteService } from '../../admin/services/cliente.service'; 

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://127.0.0.1:3000/api/reservas';
  constructor(private http: HttpClient) { }
  
  agregarReserva(reserva: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, reserva);
  }
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit {
  nombre: string = '';
  telefono: string = '';
  fecha: string = '';
  hora: string = '';
  equipoNombre: string = ''; 

  solicitudEnviada: boolean = false;
  intentoEnvio: boolean = false; 
  mostrarError: boolean = false; 
  cargando: boolean = false;

  minDate: string = '';
  maxDate: string = '';

  // 🚩 VARIABLES PARA LA SESIÓN
  sesionIniciada: boolean = false;
  cargandoDatosCliente: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService,
    private clienteService: ClienteService, // 🚩 Inyectamos ClienteService
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    const hoy = new Date();
    this.minDate = hoy.toISOString().split('T')[0]; 
    const max = new Date();
    max.setFullYear(max.getFullYear() + 1); 
    this.maxDate = max.toISOString().split('T')[0];

    this.route.queryParams.subscribe(params => {
      this.equipoNombre = params['equipo'] || 'Equipo General';
    });

    // 🚩 VERIFICAMOS SI EL CLIENTE ESTÁ LOGUEADO AL ENTRAR
    this.verificarSesion();
  }

  // 🚩 MÉTODO MÁGICO DE AUTOCOMPLETADO
  verificarSesion() {
    const clienteId = localStorage.getItem('cliente_id');
    if (clienteId) {
      this.sesionIniciada = true;
      this.cargandoDatosCliente = true;
      
      this.clienteService.getClientePorId(clienteId).subscribe({
        next: (perfil: any) => {
          this.nombre = perfil.nombre; // Autocompleta el nombre
          this.telefono = perfil.telefono; // Autocompleta el teléfono
          this.cargandoDatosCliente = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error("No se pudieron cargar los datos del cliente", err);
          this.cargandoDatosCliente = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  soloNumeros(event: KeyboardEvent) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  get nombreValido() { return this.nombre.trim().length > 2; }
  get telefonoValido() { return /^\d{10}$/.test(this.telefono); }
  get fechaValida() { return this.fecha >= this.minDate && this.fecha <= this.maxDate; }
  get horaValida() { return this.hora >= '09:00' && this.hora <= '21:00'; }
  get formularioValido() { return this.nombreValido && this.telefonoValido && this.fechaValida && this.horaValida; }

  enviarSolicitud() {
    this.intentoEnvio = true;

    if (this.formularioValido) {
      this.cargando = true;
      
      const datos = {
        nombreCliente: this.nombre,
        telefono: this.telefono,
        fechaEvento: this.fecha,
        hora: this.hora,
        equipo: this.equipoNombre,
        estado: 'Pendiente'
      };

      this.reservaService.agregarReserva(datos).subscribe({
        next: (res: any) => {
          console.log('✨ Servidor dice OK:', res);
          this.cargando = false;
          this.solicitudEnviada = true;
          this.cdr.detectChanges(); 
        },
        error: (err: any) => {
          console.error('❌ Error capturado:', err);
          this.cargando = false;
          
          if (err.status === 0 || err.status === 201) {
            this.solicitudEnviada = true;
          } else {
            this.mostrarError = true;
          }
          this.cdr.detectChanges(); 
        }
      });

      setTimeout(() => {
        if (this.cargando) {
          this.cargando = false;
          this.cdr.detectChanges();
        }
      }, 5000);

    } else {
      this.mostrarError = true;
    }
  }

  cerrarError() { this.mostrarError = false; }
}