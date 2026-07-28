import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NotificacaoDTO,
  TotalNotificacoesNaoLidasDTO,
} from './notificacao.model';

@Injectable({ providedIn: 'root' })
export class NotificacaoApi {
  private readonly apiUrl = `${environment.apiUrl}/notificacoes`;

  constructor(private http: HttpClient) {}

  listar(): Observable<NotificacaoDTO[]> {
    return this.http.get<NotificacaoDTO[]>(this.apiUrl);
  }

  totalNaoLidas(): Observable<TotalNotificacoesNaoLidasDTO> {
    return this.http.get<TotalNotificacoesNaoLidasDTO>(
      `${this.apiUrl}/nao-lidas/total`,
    );
  }

  marcarComoLida(id: string): Observable<NotificacaoDTO> {
    return this.http.patch<NotificacaoDTO>(
      `${this.apiUrl}/${id}/lida`,
      {},
    );
  }
}
