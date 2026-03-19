import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://localhost:3000/api/reservas';

  constructor(private http: HttpClient) { }
getReservas(): Observable<any[]> {
  return this.http.get<any[]>(this.apiUrl);
}

  agregarReserva(reserva: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, reserva);
  }

  actualizarEstado(id: string, estado: string): Observable<any> {
    // Solo enviamos el nuevo estado para actualizar (Aprobado o Rechazado)
    return this.http.put<any>(`${this.apiUrl}/${id}`, { estado });
  }
}