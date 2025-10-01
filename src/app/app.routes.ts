import { Routes } from '@angular/router';
import { Pedidos } from './feature/pedidos/pedidos';

export const routes: Routes = [
  { path: '', redirectTo: '/cirurgias', pathMatch: 'full' },
  { path: 'cirurgias', component: Pedidos, title: 'MediCRM | Cirurgias' },
];
