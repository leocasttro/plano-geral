import { Routes } from '@angular/router';
import { Pedidos } from './feature/planoGeral/planoGeral';
import { Projeto } from './feature/projeto/projeto';
import {Login} from './feature/login/login';
import {authGuard} from './domain/auth/auth.guard';
import {Relatorio} from './feature/relatorio/relatorio';
import { Calendario } from './feature/calendario/calendario';
import { Configuracoes } from './feature/configuracoes/configuracoes';

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
  {
    path: 'calendario',
    component: Calendario,
    title: 'Calendário | Prosul',
    canActivate: [authGuard],
  },
  {
    path: 'relatorios',
    component: Relatorio,
    title: 'Relatórios | Prosul',
    canActivate: [authGuard],
  },
  {
    path: 'configuracoes',
    component: Configuracoes,
    title: 'Configurações | Prosul',
    canActivate: [authGuard],
  },
];
