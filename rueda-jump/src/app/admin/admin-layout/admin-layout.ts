import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit {
  adminName: string = 'Cargando...'; 
  adminUser: string = 'admin';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const adminData = localStorage.getItem('rueda_admin_data');
      if (adminData) {
        const admin = JSON.parse(adminData);
        // Usamos el nombre y el usuario capturados en el registro
        this.adminName = admin.nombre || 'Administrador';
        this.adminUser = admin.usuario || 'usuario';
      }
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('admin_logged_in');
      this.router.navigate(['/admin/login']);
    }
  }
}