import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../services/reserva.service';
import { ClienteService } from '../services/cliente.service'; 
import { EquipoService } from '../services/equipos.service'; 

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
  clientesBase: any[] = []; 
  equiposBase: any[] = []; 
  
  detallesDelDia: any[] = []; 
  diaSeleccionado: number | null = null;

  // 🚩 CONSTANTE MÁGICA: Le decimos al sistema que todos estos son estados "Activos"
  estadosActivos = ['Aprobado', 'Confirmado', 'Preparando', 'En Camino', 'Instalado', 'Recolectado'];

  constructor(
    private reservaService: ReservaService,
    private clienteService: ClienteService,
    private equipoService: EquipoService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.clienteService.getClientes().subscribe(clis => {
      this.clientesBase = clis;
      this.equipoService.getEquipos().subscribe(eqs => {
        this.equiposBase = eqs;
        this.reservaService.getReservas().subscribe(res => {
          // 🚩 Filtramos usando la nueva lista de estados logísticos
          this.reservasAprobadas = res.filter(r => this.estadosActivos.includes(r.estado));
          this.renderizarCalendario(); 
          this.cdr.detectChanges();
        });
      });
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
      this.diasCalendario.push({ numero: null, cantidadRentas: 0 });
    }

    for (let i = 1; i <= ultimoDiaMes; i++) {
      const fechaIterada = `${anio}-${(mes + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const rentasDeEsteDia = this.reservasAprobadas.filter(r => r.fechaEvento === fechaIterada);
      
      this.diasCalendario.push({
        numero: i,
        fechaCompleta: fechaIterada,
        esHoy: hoy.getDate() === i && hoy.getMonth() === mes && hoy.getFullYear() === anio,
        cantidadRentas: rentasDeEsteDia.length
      });
    }
  }

  obtenerReservasDelDia(dia: number | null) {
    if (!dia) return [];
    const fechaBuscada = `${this.anioVisible}-${(this.mesActual.getMonth() + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    return this.reservasAprobadas.filter(r => r.fechaEvento === fechaBuscada);
  }

  ver(dia: number | null) {
    this.diaSeleccionado = dia;
    const rentasDelDia = this.obtenerReservasDelDia(dia);
    
    if (rentasDelDia.length > 0) {
      this.detallesDelDia = rentasDelDia.map(renta => {
        const cliente = this.clientesBase.find(c => c.telefono === renta.telefono);
        const equipo = this.equiposBase.find(e => e.nombre === renta.equipo);
        
        let dirInfo = 'Dirección no registrada o entrega local.';
        if (renta.direccion && typeof renta.direccion === 'string') {
            dirInfo = renta.direccion;
            if (renta.colonia) dirInfo += `, Col. ${renta.colonia}`;
            if (renta.cp) dirInfo += `, C.P. ${renta.cp}`;
        } else if (renta.direccion && typeof renta.direccion === 'object' && renta.direccion.calle) {
            dirInfo = `${renta.direccion.calle}, Col. ${renta.direccion.colonia || ''}`;
        } else if (cliente && cliente.direccion && cliente.direccion.calle) {
            dirInfo = `${cliente.direccion.calle}, Col. ${cliente.direccion.colonia || ''}, C.P. ${cliente.direccion.cp || ''}`;
        }

        const precioReal = (renta.precio && renta.precio > 0) ? renta.precio : (equipo ? equipo.precio : 0);

        return { 
          ...renta, 
          direccionCompleta: dirInfo,
          medida: equipo ? equipo.medidas : 'Estándar', 
          voltaje: equipo ? equipo.voltaje : '110v',
          precioTotal: precioReal
        };
      });
    } else {
      this.detallesDelDia = [];
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

  // 🚩 TRUCO HACKER: Usamos 'actualizarEstado' que sabemos que SÍ funciona y guarda en BD
  actualizarLogistica(renta: any, nuevoEstado: string) {
    
    let mensaje = '';
    const linkRastreo = `http://localhost:4200/rastreo?id=${renta._id}`;

    switch(nuevoEstado) {
      case 'Preparando':
        mensaje = `¡Hola ${renta.nombreCliente}! 🧽 Te avisamos que ya estamos limpiando y preparando tu equipo ${renta.equipo} para tu evento de hoy. \n\n📍 Sigue tu entrega aquí: ${linkRastreo}`;
        break;
      case 'En Camino':
        mensaje = `¡Hola ${renta.nombreCliente}! 🚚 Tu equipo ${renta.equipo} ya va en camino hacia ${renta.direccionCompleta}. \n\n📍 Sigue tu entrega en vivo y prepara el pago restante de $${renta.precioTotal} aquí:\n👉 ${linkRastreo}`;
        break;
      case 'Instalado':
        mensaje = `¡Listo ${renta.nombreCliente}! 🎪 Tu equipo ${renta.equipo} ha quedado instalado. ¡A disfrutar!`;
        break;
      case 'Recolectado':
        mensaje = `¡Hola ${renta.nombreCliente}! 📦 Hemos recolectado tu equipo ${renta.equipo}. Muchas gracias por tu preferencia ❤️`;
        break;
    }

    if (mensaje !== '') {
      const numero = '52' + renta.telefono;
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, '_blank');
    }

    // Usamos el endpoint principal de estados, este no falla.
    this.reservaService.actualizarEstado(renta._id, nuevoEstado).subscribe({
      next: () => {
         renta.estado = nuevoEstado; // 🚩 Actualizamos la vista local
         this.cdr.detectChanges();
      },
      error: () => alert('Hubo un error al conectar con la base de datos.')
    });
  }
}