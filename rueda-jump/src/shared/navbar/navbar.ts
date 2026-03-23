import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {}

  // 🚩 ESTO ES LO QUE LE FALTA A TU CLASE PARA QUE EL HTML LO ENCUENTRE
  get estaLogueado(): boolean {
    return !!localStorage.getItem('cliente_id');
  }

  cerrarSesion() {
    localStorage.removeItem('token_rueda_jump');
    localStorage.removeItem('cliente_id');
    this.router.navigate(['/login']);
  }
}