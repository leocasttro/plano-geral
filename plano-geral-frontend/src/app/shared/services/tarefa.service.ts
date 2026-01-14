// ⚠️ LEGADO — será removido após migração para DDD

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TarefaDTO } from '../../domain/tarefa/tarefa.model';

@Injectable({ providedIn: 'root' })
export class TarefaService {
  private readonly apiUrl = `${environment.apiUrl}/tarefas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<TarefaDTO[]> {
    return this.http.get<TarefaDTO[]>(this.apiUrl);
  }

  criarTarefa(payload: { titulo: string; descricao?: string }): Observable<TarefaDTO> {
    return this.http.post<TarefaDTO>(this.apiUrl, payload);
  }
}
