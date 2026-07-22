import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RelatorioAlteracoesDatasDTO,
  RelatorioCalendarioTarefasDTO,
  RelatorioCargaUsuariosDTO,
  RelatorioDashboardDTO,
  RelatorioMetricasProjetosDTO,
  RelatorioProjetoResumoDTO,
  RelatorioTempoConclusaoPorTituloDTO,
  RelatorioTempoMedioPorTituloDTO,
  TempoTarefaResponsavelDTO,
} from './relatorio.model';

@Injectable({ providedIn: 'root' })
export class RelatorioApi {
  private readonly apiUrl = `${environment.apiUrl}/relatorios`;

  constructor(private http: HttpClient) {}

  dashboard(periodo: '15d' | '30d' | '90d' | 'ano' = '15d'): Observable<RelatorioDashboardDTO> {
    const params = new HttpParams().set('periodo', periodo);

    return this.http.get<RelatorioDashboardDTO>(
      `${this.apiUrl}/dashboard`,
      { params },
    );
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

  metricasProjetos(): Observable<RelatorioMetricasProjetosDTO> {
    return this.http.get<RelatorioMetricasProjetosDTO>(
      `${this.apiUrl}/projetos/metricas`,
    );
  }

  calendario(params?: {
    inicio?: string;
    fim?: string;
    projetoId?: string;
  }): Observable<RelatorioCalendarioTarefasDTO> {
    let httpParams = new HttpParams();

    if (params?.inicio) {
      httpParams = httpParams.set('inicio', params.inicio);
    }

    if (params?.fim) {
      httpParams = httpParams.set('fim', params.fim);
    }

    if (params?.projetoId) {
      httpParams = httpParams.set('projetoId', params.projetoId);
    }

    return this.http.get<RelatorioCalendarioTarefasDTO>(
      `${this.apiUrl}/calendario`,
      { params: httpParams },
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

  tempoConclusaoPorTitulo(
    titulo: string,
  ): Observable<RelatorioTempoConclusaoPorTituloDTO> {
    const params = new HttpParams().set('titulo', titulo);

    return this.http.get<RelatorioTempoConclusaoPorTituloDTO>(
      `${this.apiUrl}/tarefas/tempo-conclusao`,
      { params },
    );
  }

  tempoMedioPorTitulo(): Observable<RelatorioTempoMedioPorTituloDTO> {
    return this.http.get<RelatorioTempoMedioPorTituloDTO>(
      `${this.apiUrl}/tarefas/tempo-medio-titulos`,
    );
  }
}
