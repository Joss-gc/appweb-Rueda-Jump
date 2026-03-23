import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../services/cliente.service'; 
import { ReservaService } from '../services/reserva.service';

declare var bootstrap: any;

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './clientes.html'
})
export class Clientes implements OnInit {
  
  clientesOriginales: any[] = []; 
  clientesRegistrados: any[] = [];
  clientesNoRegistrados: any[] = [];
  
  terminoBusqueda: string = '';
  clienteActivo: any = null;
  historial: any[] = [];
  mensajeWhatsApp: string = '';
  cargando: boolean = true; 

  pestanaActiva: 'registrados' | 'invitados' = 'registrados';

  constructor(
    private clienteService: ClienteService,
    private reservaService: ReservaService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.cargando = true;
    
    this.clienteService.getClientes().subscribe({
      next: (clientesDB) => {
        
        this.reservaService.getReservas().subscribe({
          next: (reservasDB) => {
            
            // ---------------------------------------------------------
            // A) PROCESAR REGISTRADOS
            // ---------------------------------------------------------
            const clientesWeb = clientesDB.map(cliente => {
              const susReservas = reservasDB.filter(r => r.telefono === cliente.telefono);
              
              let direccionFinal = cliente.direccion;
              
              // Si el perfil no tiene dirección, pero alguna reserva sí, la tomamos
              if ((!direccionFinal || !direccionFinal.calle) && susReservas.length > 0) {
                 // Buscamos la primera reserva que tenga una 'direccion' de tipo string y de más de 5 letras
                 const reservaConDir = susReservas.find(r => r.direccion && r.direccion.length > 5);
                 if (reservaConDir) {
                    direccionFinal = { 
                      calle: reservaConDir.direccion, 
                      colonia: reservaConDir.colonia || '', 
                      cp: reservaConDir.cp || '' 
                    };
                 }
              }

              return {
                ...cliente,
                direccion: direccionFinal || { calle: 'Sin dirección', colonia: '', cp: '' },
                rentas: susReservas.length,
                historialReal: susReservas,
                esLocal: false 
              };
            });

            // ---------------------------------------------------------
            // B) PROCESAR INVITADOS (AQUÍ ESTABA EL PROBLEMA)
            // ---------------------------------------------------------
            const clientesLocales: any[] = [];
            
            reservasDB.forEach(reserva => {
              const existeEnWeb = clientesWeb.find(cw => cw.telefono === reserva.telefono);
              
              if (!existeEnWeb) {
                // 🚩 EXTRACCIÓN SÚPER BLINDADA: Sacamos los 3 campos directo de la reserva
                let calleExtraida = reserva.direccion ? reserva.direccion : 'Sin dirección registrada';
                let coloniaExtraida = reserva.colonia ? reserva.colonia : '';
                let cpExtraido = reserva.cp ? reserva.cp : '';

                const indexLocal = clientesLocales.findIndex(cl => cl.telefono === reserva.telefono);
                
                if (indexLocal !== -1) {
                  // Si el cliente invitado ya estaba en nuestra lista temporal, le sumamos la renta
                  clientesLocales[indexLocal].rentas++;
                  clientesLocales[indexLocal].historialReal.push(reserva);
                  
                  // Si esta nueva reserva trae mejor dirección que la anterior, la actualizamos
                  if (calleExtraida !== 'Sin dirección registrada' && calleExtraida.length > 3) {
                     clientesLocales[indexLocal].direccion.calle = calleExtraida;
                     clientesLocales[indexLocal].direccion.colonia = coloniaExtraida;
                     clientesLocales[indexLocal].direccion.cp = cpExtraido;
                  }
                  
                } else {
                  // 🚩 SI ES LA PRIMERA VEZ QUE VEMOS A ESTE INVITADO, LO CREAMOS ASÍ:
                  clientesLocales.push({
                    nombre: reserva.nombreCliente,
                    telefono: reserva.telefono,
                    correo: 'Cliente Invitado / Local',
                    // ESTRUCTURA EXACTA QUE ESPERA EL HTML:
                    direccion: { 
                      calle: calleExtraida,
                      colonia: coloniaExtraida,
                      cp: cpExtraido
                    }, 
                    rentas: 1,
                    historialReal: [reserva],
                    esLocal: true 
                  });
                }
              }
            });

            // ---------------------------------------------------------
            // C) UNIR Y MOSTRAR
            // ---------------------------------------------------------
            this.clientesOriginales = [...clientesWeb, ...clientesLocales];
            this.filtrarYDividir();
            
            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("Error al cargar reservas para clientes:", err);
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error("Error al cargar clientes web:", err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscar() {
    this.filtrarYDividir();
  }

  filtrarYDividir() {
    const texto = this.terminoBusqueda.toLowerCase();
    
    const filtrados = this.clientesOriginales.filter(c => 
      c.nombre?.toLowerCase().includes(texto) || 
      c.telefono?.includes(texto) || 
      (c.correo && c.correo.toLowerCase().includes(texto))
    );

    this.clientesRegistrados = filtrados.filter(c => !c.esLocal); 
    this.clientesNoRegistrados = filtrados.filter(c => c.esLocal); 
  }

  cambiarPestana(pestana: 'registrados' | 'invitados') {
    this.pestanaActiva = pestana;
  }

  verHistorial(cliente: any) {
    this.clienteActivo = cliente;
    this.historial = (cliente.historialReal || []).sort((a: any, b: any) => {
      const fechaA = new Date(a.fechaCreacion || a.fechaEvento).getTime();
      const fechaB = new Date(b.fechaCreacion || b.fechaEvento).getTime();
      return fechaB - fechaA;
    }); 
  }

  prepararMensaje(cliente: any) {
    this.clienteActivo = cliente;
    this.mensajeWhatsApp = `Hola ${cliente.nombre}, te saludamos de Rueda Jump 🎪. ¿En qué te podemos ayudar hoy?`;
  }

  enviarWhatsApp() {
    if (this.clienteActivo && this.clienteActivo.telefono) {
      const numero = '52' + this.clienteActivo.telefono; 
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(this.mensajeWhatsApp)}`;
      window.open(url, '_blank');
    }
  }
}