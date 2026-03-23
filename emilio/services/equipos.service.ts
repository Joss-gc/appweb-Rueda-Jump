import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EquipoService {
  private apiUrl = 'http://localhost:3000/api/equipos';

  constructor(private http: HttpClient) { }

  // 1. Obtener todos (Lo usa el catálogo y el inventario)
  getEquipos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 2. Agregar uno nuevo (Lo pide el Inventario)
  agregarEquipo(equipo: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, equipo);
  }

  // 3. Actualizar uno existente (Lo pide el Inventario)
  actualizarEquipo(id: string, equipo: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, equipo);
  }

  // 4. Eliminar uno (Lo pide el Inventario)
  eliminarEquipo(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}