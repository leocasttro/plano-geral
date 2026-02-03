import { Routes } from '@angular/router';
import { Pedidos } from './feature/planoGeral/planoGeral';
import { Projeto } from './feature/projeto/projeto';

export const routes: Routes = [
  { path: '', redirectTo: '/planoGeral', pathMatch: 'full' },
  { path: 'planoGeral', component: Pedidos, title: 'Plano Geral | Prosul' },
  { path: 'projetos', component: Projeto, title: 'Projetos | Prosul' },
];
