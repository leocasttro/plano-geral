import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RelatorioAlteracoesDatasDTO,
  RelatorioCargaUsuariosDTO,
  RelatorioDashboardDTO,
  RelatorioProjetoResumoDTO, TempoTarefaResponsavelDTO,
} from './relatorio.model';

@Injectable({ providedIn: 'root' })
export class RelatorioApi {
  private readonly apiUrl = `${environment.apiUrl}/relatorios`;

  constructor(private http: HttpClient) {}

  dashboard(): Observable<RelatorioDashboardDTO> {
    return this.http.get<RelatorioDashboardDTO>(`${this.apiUrl}/dashboard`);
  }

  cargaUsuarios(): Observable<RelatorioCargaUsuariosDTO> {
    return this.http.get<RelatorioCargaUsuariosDTO>(
      `${this.apiUrl}/usuarios/carga`,
    );
  }

  resumoProjeto(projetoId: string): Observable<RelatorioProjetoResumoDTO> {
    return this.http.get<RelatorioProjetoResumoDTO>(
      `${this.apiUrl}/projetos/${projetoId}/resumo`,
    );
  }

  alteracoesDatasTarefa(
    tarefaId: string,
  ): Observable<RelatorioAlteracoesDatasDTO> {
    return this.http.get<RelatorioAlteracoesDatasDTO>(
      `${this.apiUrl}/tarefas/${tarefaId}/alteracoes-datas`,
    );
  }

  tempoTarefaPorResponsavel(
    tarefaId: string,
  ): Observable<TempoTarefaResponsavelDTO[]> {
    return this.http.get<TempoTarefaResponsavelDTO[]>(
      `${this.apiUrl}/tarefas/${tarefaId}/tempo-responsavel`,
    );
  }
}
