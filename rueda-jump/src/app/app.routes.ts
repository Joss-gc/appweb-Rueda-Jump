import { Routes } from '@angular/router';
import { Home } from './public/home/home';
import { Catalogo } from './public/catalogo/catalogo';
import { Contacto } from './public/contacto/contacto';
import { RegistroAdmin } from './public/registro-admin/registro-admin';
import { Login } from './admin/login/login';
import { AdminLayout } from './admin/admin-layout/admin-layout'; 
import { Dashboard } from './admin/dashboard/dashboard';
import { Calendario } from './admin/calendario/calendario';
import { Inventario } from './admin/inventario/inventario';

// 👇 IMPORTA TUS NUEVOS COMPONENTES
import { Ingresos } from './admin/ingresos/ingresos';
import { Rentas } from './admin/rentas/rentas';
import { Equipos } from './admin/equipos/equipos';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'catalogo', component: Catalogo },
  { path: 'contacto', component: Contacto },
  { path: 'admin/login', component: Login },
  { path: 'admin/registro', component: RegistroAdmin },

  { 
    path: 'admin', 
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'calendario', component: Calendario },
      { path: 'inventario', component: Inventario },

      // 🔥 NUEVAS RUTAS (ESTO TE FALTABA)
      { path: 'ingresos', component: Ingresos },
      { path: 'rentas', component: Rentas },
      { path: 'equipos', component: Equipos }
    ]
  },

  { path: '**', redirectTo: 'home' }
];