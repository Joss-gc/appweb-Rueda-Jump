import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common'; 
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  adminName: string = 'Joel'; 

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const adminData = localStorage.getItem('rueda_admin_data');
      if (adminData) {
        const admin = JSON.parse(adminData);
        this.adminName = admin.nombre;
      }
    }
  }

  // 🔥 NUEVA FUNCIÓN PARA NAVEGACIÓN
  irA(ruta: string) {
    this.router.navigate(['/admin', ruta]);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('admin_logged_in');
      this.router.navigate(['/admin/login']);
    }
  }
}