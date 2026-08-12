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
  RelatorioLeadTimeDTO, RelatorioDisponibilidadeUsuariosDTO,
  RelatorioPessoalDTO,
} from './relatorio.model';

export interface RelatorioFiltrosRequest {
  projetoId?: string;
  usuarioId?: string;
  componente?: string;
  atividadePrincipal?: string;
  subatividade?: string;
  inicio?: string;
  fim?: string;
}

@Injectable({ providedIn: 'root' })
export class RelatorioApi {
  private readonly apiUrl = `${environment.apiUrl}/relatorios`;

  constructor(private http: HttpClient) {}

  dashboard(
    periodo: '15d' | '30d' | '90d' | 'ano' = '15d',
    filtros?: RelatorioFiltrosRequest,
  ): Observable<RelatorioDashboardDTO> {
    const params = this.buildFiltrosParams(filtros).set('periodo', periodo);

    return this.http.get<RelatorioDashboardDTO>(
      `${this.apiUrl}/dashboard`,
      { params },
    );
  }

  cargaUsuarios(filtros?: RelatorioFiltrosRequest): Observable<RelatorioCargaUsuariosDTO> {
    return this.http.get<RelatorioCargaUsuariosDTO>(
      `${this.apiUrl}/usuarios/carga`,
      { params: this.buildFiltrosParams(filtros) },
    );
  }

  resumoProjeto(projetoId: string): Observable<RelatorioProjetoResumoDTO> {
    return this.http.get<RelatorioProjetoResumoDTO>(
      `${this.apiUrl}/projetos/${projetoId}/resumo`,
    );
  }

  metricasProjetos(filtros?: RelatorioFiltrosRequest): Observable<RelatorioMetricasProjetosDTO> {
    return this.http.get<RelatorioMetricasProjetosDTO>(
      `${this.apiUrl}/projetos/metricas`,
      { params: this.buildFiltrosParams(filtros) },
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

  tempoMedioPorTitulo(filtros?: RelatorioFiltrosRequest): Observable<RelatorioTempoMedioPorTituloDTO> {
    return this.http.get<RelatorioTempoMedioPorTituloDTO>(
      `${this.apiUrl}/tarefas/tempo-medio-titulos`,
      { params: this.buildFiltrosParams(filtros) },
    );
  }

  leadTime(): Observable<RelatorioLeadTimeDTO> {
    return this.http.get<RelatorioLeadTimeDTO>(
      `${this.apiUrl}/lead-time`,
    );
  }

  disponibilidadeUsuarios(filtros?: RelatorioFiltrosRequest): Observable<RelatorioDisponibilidadeUsuariosDTO> {
    return this.http.get<RelatorioDisponibilidadeUsuariosDTO>(
      `${this.apiUrl}/usuarios/disponibilidade`,
      { params: this.buildFiltrosParams(filtros) },
    );
  }

  pessoal(): Observable<RelatorioPessoalDTO> {
    return this.http.get<RelatorioPessoalDTO>(
      `${this.apiUrl}/pessoal`,
    );
  }

  private buildFiltrosParams(filtros?: RelatorioFiltrosRequest): HttpParams {
    let params = new HttpParams();

    Object.entries(filtros ?? {}).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return params;
  }
}
