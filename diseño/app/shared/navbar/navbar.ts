import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- ESTO ES LO QUE FALTA

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule], // <--- AGREGALO AQUÍ TAMBIÉN
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar { }