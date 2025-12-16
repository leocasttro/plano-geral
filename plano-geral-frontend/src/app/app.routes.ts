import { Routes } from '@angular/router';
import { Pedidos } from './feature/planoGeral/planoGeral';

export const routes: Routes = [
  { path: '', redirectTo: '/planoGeral', pathMatch: 'full' },
  { path: 'planoGeral', component: Pedidos, title: 'Plano Geral | Prosul' },
];
