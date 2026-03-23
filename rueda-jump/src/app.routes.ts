import { Routes } from '@angular/router';

// Vistas Públicas (Clientes)
import { Home } from './public/home/home';
import { Catalogo } from './public/catalogo/catalogo';
import { Checkout } from './public/checkout/checkout';
import { Perfil } from './public/perfil/perfil'; 
import { Rastreo } from './public/rastreo/rastreo'; // 🚩 AQUÍ ESTÁ EL CEREBRO DEL RASTREO

// EL NUEVO LOGIN PARA CLIENTES (usamos un "Alias" o apodo)
import { Login as ClienteLogin } from './public/login/login'; 

// Vistas de Admin (usamos un Alias para diferenciarlo)
import { Login as AdminLogin } from './admin/login/login';
import { Dashboard } from './admin/dashboard/dashboard';
import { Clientes } from './admin/clientes/clientes';
import { Calendario } from './admin/calendario/calendario';
import { Inventario } from './admin/inventario/inventario';
import { Solicitudes } from './admin/solicitudes/solicitudes';

export const routes: Routes = [
  // Rutas del cliente
  { path: '', component: Home },
  { path: 'catalogo', component: Catalogo },
  { path: 'checkout', component: Checkout },
  { path: 'login', component: ClienteLogin },
  { path: 'perfil', component: Perfil },
  { path: 'rastreo', component: Rastreo }, // 🚩 LA NUEVA RUTA PARA TUS INVITADOS

  // Rutas del Admin
  { path: 'admin/login', component: AdminLogin },
  { path: 'admin/dashboard', component: Dashboard },
  { path: 'admin/clientes', component: Clientes },
  { path: 'admin/solicitudes', component: Solicitudes },
  { path: 'admin/calendario', component: Calendario },
  { path: 'admin/inventario', component: Inventario },
  
  // Ruta comodín (si alguien escribe una URL rara, lo manda al home)
  { path: '**', redirectTo: '' }
];