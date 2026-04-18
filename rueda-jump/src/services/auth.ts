import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://127.0.0.1:3000/api/auth';

  constructor(private http: HttpClient) { }

  registrarCliente(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/registro`, datos);
  }

  iniciarSesion(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, datos);
  }

  guardarToken(token: string) { localStorage.setItem('token_rueda_jump', token); }
  obtenerToken() { return localStorage.getItem('token_rueda_jump'); }
  cerrarSesion() { localStorage.removeItem('token_rueda_jump'); }
}