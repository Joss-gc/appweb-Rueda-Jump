import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = 'http://127.0.0.1:3000/api/clientes';

  constructor(private http: HttpClient) { }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  agregarCliente(cliente: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, cliente);
  }

  getClientePorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  actualizarCliente(id: string, datos: any, foto?: File): Observable<any> {
    const formData = new FormData();
    
    formData.append('nombre', datos.nombre);
    formData.append('telefono', datos.telefono);
    formData.append('direccion', JSON.stringify(datos.direccion));
    
    if (foto) {
      formData.append('foto', foto);
    }

    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }
}