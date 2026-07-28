import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TarefaDTO, AtividadeDTO } from './tarefa.model';

export interface CriarTarefaRequest {
  titulo: string;
  tituloCatalogoId?: string | null;
  descricao?: string;
  projetoId: string;
}

export interface SolicitacaoAlteracaoDatasDTO {
  id: string;
  tarefaId: string;
  solicitanteId: string;
  solicitanteNome: string;
  dataInicio: string | null;
  dataFim: string | null;
  justificativa: string;
  status: string;
  aprovadorId: string | null;
  aprovadorNome: string | null;
  createdAt: string;
  updatedAt: string;
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
  ): Observable<TarefaDTO> {
    return this.http.post<TarefaDTO>(`${this.apiUrl}/${tarefaId}/status`, {
      novoStatus,
    });
  }

  adicionarComentario(
    tarefaId: string,
    comentario: string,
  ): Observable<TarefaDTO> {
    return this.http.post<TarefaDTO>(`${this.apiUrl}/${tarefaId}/comentarios`, {
      comentario,
    });
  }

  buscarAtividades(tarefaId: string): Observable<AtividadeDTO[]> {
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

  alterarPrioridade(id: string, novaPrioridade: string): Observable<TarefaDTO> {
    return this.http.patch<TarefaDTO>(`${this.apiUrl}/${id}/prioridade`, {novaPrioridade},);
  }

  atribuirResponsavel(id: string, responsavelId: string): Observable<TarefaDTO> {
    return this.http.post<TarefaDTO>(
      `${this.apiUrl}/${id}/atribuirResponsavel`,
      { responsavelId },
    );
  }

  alterarDatas(
    id: string,
    payload: {
      dataInicio?: string;
      dataFim?: string;
      justificativa?: string;
    },
  ): Observable<TarefaDTO> {
    return this.http.patch<TarefaDTO>(`${this.apiUrl}/${id}/datas`, payload);
  }

  solicitarAlteracaoDatas(
    id: string,
    payload: {
      dataInicio?: string;
      dataFim?: string;
      justificativa?: string;
    },
  ): Observable<{ id: string; status: string }> {
    return this.http.post<{ id: string; status: string }>(
      `${this.apiUrl}/${id}/solicitacoes-datas`,
      payload,
    );
  }

  buscarSolicitacaoAlteracaoDatas(
    solicitacaoId: string,
  ): Observable<SolicitacaoAlteracaoDatasDTO> {
    return this.http.get<SolicitacaoAlteracaoDatasDTO>(
      `${this.apiUrl}/solicitacoes-datas/${solicitacaoId}`,
    );
  }

  buscarSolicitacaoAlteracaoDatasPendente(
    tarefaId: string,
  ): Observable<SolicitacaoAlteracaoDatasDTO | null> {
    return this.http.get<SolicitacaoAlteracaoDatasDTO | null>(
      `${this.apiUrl}/${tarefaId}/solicitacoes-datas/pendente`,
    );
  }

  aprovarAlteracaoDatas(solicitacaoId: string): Observable<TarefaDTO> {
    return this.http.post<TarefaDTO>(
      `${this.apiUrl}/solicitacoes-datas/${solicitacaoId}/aprovar`,
      {},
    );
  }

  reprovarAlteracaoDatas(solicitacaoId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/solicitacoes-datas/${solicitacaoId}/reprovar`,
      {},
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
