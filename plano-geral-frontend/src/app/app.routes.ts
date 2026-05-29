import { Routes } from '@angular/router';
import { Pedidos } from './feature/planoGeral/planoGeral';
import { Projeto } from './feature/projeto/projeto';
import {Login} from './feature/login/login';
import {authGuard} from './domain/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Login | Prosul' },
  { path: '', redirectTo: '/planoGeral', pathMatch: 'full' },
  {
    path: 'planoGeral',
    component: Pedidos,
    title: 'Plano Geral | Prosul',
    canActivate: [authGuard],
  },
  {
    path: 'projetos',
    component: Projeto,
    title: 'Projetos | Prosul',
    canActivate: [authGuard],
  },
];
