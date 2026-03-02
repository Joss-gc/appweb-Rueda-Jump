import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  usuario = '';
  password = '';
  errorLogin = false;

  constructor(private router: Router) {}

  login(event: Event) {
    event.preventDefault();
    
    const adminGuardado = localStorage.getItem('rueda_admin_data');
    
    if (adminGuardado) {
      const admin = JSON.parse(adminGuardado);
      if (this.usuario === admin.usuario && this.password === admin.password) {
        localStorage.setItem('admin_logged_in', 'true');
        this.errorLogin = false;
        this.router.navigate(['/admin/dashboard']);
        return;
      }
    }
    this.errorLogin = true;
  }
  loginAd(event: Event) {
    event.preventDefault();
    
    const adminGuardado = localStorage.getItem('rueda_admin_data');
    
    if (adminGuardado) {
      const admin = JSON.parse(adminGuardado);
      if (this.usuario === admin.usuario && this.password === admin.password) {
        localStorage.setItem('admin_logged_in', 'true');
        this.errorLogin = false;
        this.router.navigate(['/admin/dashboard']);
        return;
      }
    }
    
    this.errorLogin = true;
  }
}
