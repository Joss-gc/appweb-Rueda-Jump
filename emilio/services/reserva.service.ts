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

  getReservasPorTelefono(telefono: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${telefono}`);
  }

  agregarReserva(reserva: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, reserva);
  }

  actualizarEstado(id: string, estado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, { estado });
  }

  subirComprobantePago(idReserva: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('comprobante', archivo);
    return this.http.put<any>(`${this.apiUrl}/${idReserva}/pago`, formData);
  }

  // 🚩 NUEVO: FUNCIÓN PARA ACTUALIZAR EL ESTADO DE PAGO DIRECTAMENTE
  actualizarReservaCompleta(id: string, datosActualizados: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, datosActualizados);
  }
}