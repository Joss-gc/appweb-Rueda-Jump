import { Component, OnInit, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- 🚩 EL SERVICIO ESTÁ AQUÍ MISMO AHORA ---
@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private apiUrl = 'http://localhost:3000/api/equipos';
  constructor(private http: HttpClient) { }
  getEquipos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

// --- 🚩 TU COMPONENTE ---
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

  constructor(
    private route: ActivatedRoute,
    private equipoService: EquipoService // Ahora lo toma de aquí arriba
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.equipoService.getEquipos().subscribe({
      next: (res: any) => {
        this.productos = res;
        this.productosFiltrados = [...this.productos];
        this.cargando = false;
        this.revisarUrl();
      },
      error: (err: any) => {
        console.error('Error al conectar:', err);
        this.cargando = false;
      }
    });
  }

  revisarUrl() {
    this.route.queryParams.subscribe(p => {
      if (p['abrir']) {
        const encontrado = this.productos.find(i => i._id === p['abrir']);
        if (encontrado) this.abrirModal(encontrado);
      }
    });
  }

  filtrar(cat: string) {
    this.categoriaActiva = cat;
    this.aplicarFiltros();
  }

  buscar() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter(p => {
      const matchCat = this.categoriaActiva === 'Todos' || p.categoria === this.categoriaActiva;
      const matchBus = p.nombre.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      return matchCat && matchBus;
    });
  }

  abrirModal(p: any) {
    this.productoSeleccionado = p;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }
}