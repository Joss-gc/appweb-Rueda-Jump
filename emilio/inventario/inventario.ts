import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EquipoService } from '../services/equipos.service'; 

declare var bootstrap: any;

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inventario.html'
})
export class Inventario implements OnInit {
  
  listaEquipos: any[] = [];
  archivoSeleccionado: File | null = null;
  
  // 🚩 Aseguramos que la propiedad se llame 'medidas' para coincidir con el backend
  equipoSeleccionado: any = { _id: '', nombre: '', stock: 0, precio: 0, medidas: '', voltaje: '110v', descripcion: '', imgUrl: '', categoria: 'Todos', destacado: false };
  nuevoEquipo: any = { nombre: '', stock: 1, precio: null, medidas: '', voltaje: '110v', descripcion: '', imgUrl: '', categoria: 'Todos', destacado: false }; 
  mensajeError: string = '';

  constructor(
    private equipoService: EquipoService,
    private cdr: ChangeDetectorRef 
  ) { } 

  ngOnInit() {
    this.cargarEquipos(); 
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  cargarEquipos() {
    this.equipoService.getEquipos().subscribe({
      next: (data: any) => {
        this.listaEquipos = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al conectar con el API:', err);
        this.mostrarError('No se pudo cargar el inventario.');
        this.cdr.detectChanges();
      }
    });
  }

  seleccionar(equipo: any) { 
    // 🚩 Al seleccionar, pasamos las propiedades correctas al objeto
    this.equipoSeleccionado = { ...equipo, medidas: equipo.medidas || '', categoria: equipo.categoria || 'Todos', destacado: equipo.destacado || false }; 
    this.archivoSeleccionado = null;
  }

  guardarNuevo() {
    if (!this.nuevoEquipo.nombre || this.nuevoEquipo.precio == null) {
      return this.mostrarError('Nombre y Precio son obligatorios.');
    }

    const formData = new FormData();
    formData.append('nombre', this.nuevoEquipo.nombre);
    formData.append('precio', this.nuevoEquipo.precio.toString());
    formData.append('stock', this.nuevoEquipo.stock.toString());
    // 🚩 Enviamos las 'medidas' tal como lo espera el backend
    formData.append('medidas', this.nuevoEquipo.medidas);
    formData.append('voltaje', this.nuevoEquipo.voltaje);
    formData.append('descripcion', this.nuevoEquipo.descripcion);
    formData.append('categoria', this.nuevoEquipo.categoria);
    formData.append('destacado', this.nuevoEquipo.destacado.toString());

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    this.equipoService.agregarEquipo(formData).subscribe({
      next: () => {
        this.cerrarModal('modalAgregar');
        this.cargarEquipos(); 
        this.nuevoEquipo = { nombre: '', stock: 1, precio: null, medidas: '', voltaje: '110v', descripcion: '', imgUrl: '', categoria: 'Todos', destacado: false }; 
        this.archivoSeleccionado = null;
      },
      error: () => this.mostrarError('Error al guardar el equipo.')
    });
  }

  guardarEdicion() {
    if (!this.equipoSeleccionado._id) return;

    const formData = new FormData();
    formData.append('nombre', this.equipoSeleccionado.nombre);
    formData.append('precio', this.equipoSeleccionado.precio.toString());
    formData.append('stock', this.equipoSeleccionado.stock.toString());
    formData.append('medidas', this.equipoSeleccionado.medidas);
    formData.append('voltaje', this.equipoSeleccionado.voltaje);
    formData.append('descripcion', this.equipoSeleccionado.descripcion);
    formData.append('categoria', this.equipoSeleccionado.categoria); 
    formData.append('destacado', this.equipoSeleccionado.destacado.toString()); 

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    this.equipoService.actualizarEquipo(this.equipoSeleccionado._id, formData).subscribe({
      next: () => {
        this.cerrarModal('modalEditar');
        this.cargarEquipos();
      },
      error: () => this.mostrarError('No se pudo actualizar el registro.')
    });
  }

  eliminar() { 
    if (this.equipoSeleccionado._id) {
      this.equipoService.eliminarEquipo(this.equipoSeleccionado._id).subscribe({
        next: () => {
          this.cerrarModal('modalEliminar');
          this.listaEquipos = this.listaEquipos.filter(e => e._id !== this.equipoSeleccionado._id);
          this.cdr.detectChanges(); 
        },
        error: () => this.mostrarError('No se pudo eliminar el equipo.')
      });
    }
  }

  cerrarModal(id: string) {
    const modalElem = document.getElementById(id);
    if (modalElem) {
      let modal = bootstrap.Modal.getInstance(modalElem);
      if (!modal) {
        modal = new bootstrap.Modal(modalElem);
      }
      modal.hide();
      
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }

  mostrarError(mensaje: string) {
    this.mensajeError = mensaje;
    const modalErrorElem = document.getElementById('modalError');
    if (modalErrorElem) {
      let modalError = bootstrap.Modal.getInstance(modalErrorElem);
      if (!modalError) {
        modalError = new bootstrap.Modal(modalErrorElem);
      }
      modalError.show();
    } else {
      alert(mensaje); 
    }
  }
}