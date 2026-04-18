import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // 👈 Importación necesaria

// 🚩 IMPORTACIÓN DE GRÁFICAS AÑADIDA
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(), // 👈 Habilita la comunicación con tu servidor Node.js
    
    // 🚩 HABILITAMOS EL MOTOR DE GRÁFICAS DE CHART.JS
    provideCharts(withDefaultRegisterables())
  ]
};