import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TarefaDTO, AtividadeDTO } from './tarefa.model';

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

  buscarTodos(): Observable<TarefaDTO[]> {
    return this.http.get<TarefaDTO[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<TarefaDTO> {
    return this.http.get<TarefaDTO>(`${this.apiUrl}/${id}`);
  }

  atualizarStatus(
    tarefaId: string,
    novoStatus: string,
    usuario: string,
  ): Observable<TarefaDTO> {
    return this.http.post<TarefaDTO>(`${this.apiUrl}/${tarefaId}/status`, {
      novoStatus,
      usuario,
    });
  }

  adicionarComentario(
    tarefaId: string,
    comentario: string,
    usuario: string,
  ): Observable<TarefaDTO> {
    return this.http.post<TarefaDTO>(`${this.apiUrl}/${tarefaId}/comentarios`, {
      comentario,
      usuario,
    });
  }

  buscarAtividades(tarefaId: string): Observable<AtividadeDTO[]> {
    console.log(tarefaId);
    return this.http.get<AtividadeDTO[]>(
      `${this.apiUrl}/${tarefaId}/atividades`,
    );
  }

  adicionarChecklistItem(
    tarefaId: string,
    nome: string,
  ): Observable<TarefaDTO> {
    return this.http.post<TarefaDTO>(`${this.apiUrl}/${tarefaId}/checklist`, {
      nome,
    });
  }

  toggleChecklistItem(id: string, itemId: string): Observable<TarefaDTO> {
    return this.http.patch<TarefaDTO>(
      `${this.apiUrl}/${id}/checklist/${itemId}/toggle`,
      {},
    );
  }
}
