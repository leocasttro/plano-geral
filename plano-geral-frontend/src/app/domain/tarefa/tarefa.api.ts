import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TarefaDTO } from './tarefa.model';

export interface CriarTarefaRequest {
  titulo: string;
  descricao?: string;
}

@Injectable({ providedIn: 'root' })
export class TarefaApi {
  private readonly apiUrl = `${environment.apiUrl}/tarefas`;

  constructor(private http: HttpClient) {}

  criar(payload: CriarTarefaRequest): Observable<TarefaDTO> {
    return this.http.post<TarefaDTO>(this.apiUrl, payload);
  }

  buscarPorId(id: string): Observable<TarefaDTO> {
    return this.http.get<TarefaDTO>(`${this.apiUrl}/${id}`);
  }
}
