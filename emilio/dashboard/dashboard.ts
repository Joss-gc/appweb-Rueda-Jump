import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquipoService } from '../services/equipos.service';
import { ClienteService } from '../services/cliente.service';
import { ReservaService } from '../services/reserva.service';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare var bootstrap: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {

  ingresosMes: number = 0;
  equiposRentados: number = 0;
  totalEquipos: number = 0;
  nuevosClientes: number = 0;
  solicitudesPendientesCount: number = 0;
  proximasRentas: any[] = [];
  equiposDisponibles: any[] = [];
  clientesBase: any[] = []; 
  todasLasReservasAprobadas: any[] = []; 

  // 🚩 AQUÍ ESTÁ LA VARIABLE QUE FALTABA
  stockTotalInventario: number = 0; 

  nuevaReserva: any = { 
    nombreCliente: '', 
    telefono: '', 
    direccion: '', 
    colonia: '', 
    cp: '', 
    equipo: '', 
    fechaEvento: '', 
    hora: '', 
    estado: 'Aprobado' 
  };
  
  intentoEnvio: boolean = false;
  minDate: string = new Date().toISOString().split('T')[0];
  maxDate: string = '2026-12-31';

  @ViewChild('reportePDF', { static: false }) reportePDFElement!: ElementRef;
  anioReporte: number = new Date().getFullYear();
  ingresoTotalAnual: number = 0;
  rentasTotalesAnual: number = 0;
  
  public chartType: ChartType = 'bar';
  public chartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      { data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], label: 'Ingresos ($)', backgroundColor: '#0d6efd', borderRadius: 4 }
    ]
  };
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: false } }
  };

  constructor(
    private equipoService: EquipoService,
    private clienteService: ClienteService,
    private reservaService: ReservaService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.equipoService.getEquipos().subscribe(eqs => {
      this.totalEquipos = eqs.length;
      this.equiposDisponibles = eqs; 
      
      // 🚩 CALCULAMOS EL STOCK REAL (Suma de todo el stock de todos los equipos)
      this.stockTotalInventario = eqs.reduce((suma, eq) => suma + (eq.stock || 0), 0);
      
      this.clienteService.getClientes().subscribe(clis => {
        this.clientesBase = clis;
        this.nuevosClientes = clis.length;
        
        this.reservaService.getReservas().subscribe(res => {
          this.solicitudesPendientesCount = res.filter(r => r.estado === 'Pendiente').length;
          this.todasLasReservasAprobadas = res.filter(r => r.estado === 'Aprobado' || r.estado === 'Confirmado');
          
          this.equiposRentados = this.todasLasReservasAprobadas.length; 
          this.ingresosMes = 0;

          this.proximasRentas = res.sort((a, b) => new Date(b.createdAt || b.fechaCreacion).getTime() - new Date(a.createdAt || a.fechaCreacion).getTime())
            .slice(0, 5)
            .map(r => {
              const eq = this.equiposDisponibles.find(e => e.nombre === r.equipo);
              const precio = eq ? eq.precio : 800; 
              const medida = eq ? eq.medidas : 'Estándar';
              const voltaje = eq ? eq.voltaje : '110v';
              
              if(r.estado === 'Aprobado' || r.estado === 'Confirmado') {
                this.ingresosMes += precio; 
              }

              const cli = this.clientesBase.find(c => c.telefono === r.telefono);
              
              let direccionTexto = 'Sin dirección';
              if (r.direccion && typeof r.direccion === 'string' && r.direccion.trim() !== '') {
                  direccionTexto = r.direccion;
                  if (r.colonia) direccionTexto += `, Col. ${r.colonia}`;
                  if (r.cp) direccionTexto += `, C.P. ${r.cp}`;
              } else if (r.direccion && typeof r.direccion === 'object' && r.direccion.calle) {
                  direccionTexto = r.direccion.calle;
                  if (r.direccion.colonia) direccionTexto += `, Col. ${r.direccion.colonia}`;
                  if (r.direccion.cp) direccionTexto += `, C.P. ${r.direccion.cp}`;
              } else if (cli && cli.direccion && cli.direccion.calle) {
                  direccionTexto = cli.direccion.calle;
                  if (cli.direccion.colonia) direccionTexto += `, Col. ${cli.direccion.colonia}`;
                  if (cli.direccion.cp) direccionTexto += `, C.P. ${cli.direccion.cp}`;
              }

              let colorEstado = 'secondary';
              if (r.estado === 'Pendiente') colorEstado = 'warning';
              if (r.estado === 'Aprobado' || r.estado === 'Confirmado') colorEstado = 'success';
              if (r.estado === 'Rechazado') colorEstado = 'danger';

              return {
                cliente: r.nombreCliente,
                telefono: r.telefono,
                equipo: r.equipo,
                precio: precio,
                medida: medida,
                voltaje: voltaje,
                direccion: direccionTexto, 
                fecha: r.fechaEvento,
                hora: r.hora, 
                estado: r.estado,
                color: colorEstado,
                estadoPago: r.estadoPago || '---'
              };
            });
            
          this.generarDatosReporte(); 
          this.cdr.detectChanges(); 
        });
      });
    });
  }

  generarDatosReporte() {
    const ingresosPorMes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.ingresoTotalAnual = 0;
    this.rentasTotalesAnual = 0;

    const rentasDelAnio = this.todasLasReservasAprobadas.filter(r => {
      if (!r.fechaEvento) return false;
      const anioRenta = new Date(r.fechaEvento).getFullYear();
      return anioRenta === this.anioReporte;
    });

    rentasDelAnio.forEach(renta => {
      const mesRenta = new Date(renta.fechaEvento).getMonth(); 
      const equipoInventario = this.equiposDisponibles.find(e => e.nombre === renta.equipo);
      const precio = equipoInventario ? equipoInventario.precio : 800;

      ingresosPorMes[mesRenta] += precio;
      this.ingresoTotalAnual += precio;
      this.rentasTotalesAnual++;
    });

    this.chartData.datasets[0].data = ingresosPorMes;
    this.chartData = { ...this.chartData }; 
    this.cdr.detectChanges();
  }

  cambiarAnioReporte(direccion: number) {
    this.anioReporte += direccion;
    this.generarDatosReporte();
  }

  descargarPDF() {
    if (!this.reportePDFElement) return;
    const data = this.reportePDFElement.nativeElement;
    setTimeout(() => {
      html2canvas(data, { scale: 2, useCORS: true, logging: false }).then(canvas => {
        const pdf = new jsPDF('l', 'mm', 'letter');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        pdf.addImage(contentDataURL, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`Reporte_RuedaJump_${this.anioReporte}.pdf`);
      });
    }, 500); 
  }

  // 🚩 Validaciones estrictas
  get nombreValido() { return !!this.nuevaReserva.nombreCliente && this.nuevaReserva.nombreCliente.trim().length >= 3 && this.nuevaReserva.nombreCliente.trim().length <= 50; }
  get telefonoValido() { return !!this.nuevaReserva.telefono && /^\d{10}$/.test(this.nuevaReserva.telefono); }
  get equipoValido() { return !!this.nuevaReserva.equipo && this.nuevaReserva.equipo !== ''; }
  get fechaValida() { return !!this.nuevaReserva.fechaEvento && this.nuevaReserva.fechaEvento !== ''; }
  get horaValida() { return !!this.nuevaReserva.hora && this.nuevaReserva.hora !== ''; }
  get calleValida() { return !!this.nuevaReserva.direccion && this.nuevaReserva.direccion.trim().length >= 5; } 
  get coloniaValida() { return !!this.nuevaReserva.colonia && this.nuevaReserva.colonia.trim().length >= 3; } 
  get cpValido() { return !!this.nuevaReserva.cp && /^\d{5}$/.test(this.nuevaReserva.cp); }

  soloNumeros(event: any) {
    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) event.preventDefault();
  }

  guardarReserva() {
    this.intentoEnvio = true;
    if (this.nombreValido && this.telefonoValido && this.calleValida && this.coloniaValida && this.cpValido && this.equipoValido && this.fechaValida && this.horaValida) {
      
      this.reservaService.agregarReserva(this.nuevaReserva).subscribe({
        next: () => {
          this.cerrarModal('modalNuevaReserva');
          this.mostrarExito();
          this.cargarEstadisticas();
          this.nuevaReserva = { nombreCliente: '', telefono: '', direccion: '', colonia: '', cp: '', equipo: '', fechaEvento: '', hora: '', estado: 'Aprobado' };
          this.intentoEnvio = false;
        },
        error: () => this.abrirModalError()
      });
    } else {
      this.abrirModalError();
    }
  }

  cerrarModal(id: string) {
    const modalElem = document.getElementById(id);
    if (modalElem) {
      const modal = bootstrap.Modal.getInstance(modalElem) || new bootstrap.Modal(modalElem);
      modal.hide();
    }
  }

  mostrarExito() { new bootstrap.Modal(document.getElementById('modalExitoReserva')).show(); }
  abrirModalError() { new bootstrap.Modal(document.getElementById('modalErrorReserva')).show(); }

  get porcentajeOcupacion() {
    if (this.totalEquipos === 0) return 0;
    return Math.round((this.equiposRentados / this.totalEquipos) * 100);
  }
}