import { Component, OnInit } from '@angular/core';
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
  
  equipoSeleccionado: any = { _id: '', nombre: '', stock: 0, precio: 0, altura: '', voltaje: '110v', descripcion: '', imgUrl: '' };
  nuevoEquipo: any = { nombre: '', stock: 1, precio: null, altura: '', voltaje: '110v', descripcion: '', imgUrl: '' }; 
  mensajeError: string = '';

  constructor(private equipoService: EquipoService) { } 

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
      },
      error: (err: any) => {
        console.error('Error al conectar con el API:', err);
        this.mostrarError('No se pudo cargar el inventario.');
      }
    });
  }

  seleccionar(equipo: any) { 
    this.equipoSeleccionado = { ...equipo, altura: equipo.medidas || equipo.altura }; 
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
    formData.append('medidas', this.nuevoEquipo.altura);
    formData.append('voltaje', this.nuevoEquipo.voltaje);
    formData.append('descripcion', this.nuevoEquipo.descripcion);

    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    this.equipoService.agregarEquipo(formData).subscribe({
      next: () => {
        this.cerrarModal('modalAgregar');
        this.cargarEquipos(); 
        this.nuevoEquipo = { nombre: '', stock: 1, precio: null, altura: '', voltaje: '110v', descripcion: '', imgUrl: '' }; 
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
    formData.append('medidas', this.equipoSeleccionado.altura);
    formData.append('voltaje', this.equipoSeleccionado.voltaje);
    formData.append('descripcion', this.equipoSeleccionado.descripcion);

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