import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TituloTarefaCatalogoDTO } from './titulo-tarefa.model';

@Injectable({ providedIn: 'root' })
export class TituloTarefaApi {
  private readonly apiUrl = `${environment.apiUrl}/titulos-tarefa`;

  constructor(private http: HttpClient) {}

  listar(params?: {
    busca?: string;
    acao?: string;
    componente?: string;
    atividadePrincipal?: string;
    subatividade?: string;
  }): Observable<TituloTarefaCatalogoDTO[]> {
    let httpParams = new HttpParams();

    if (params?.busca) {
      httpParams = httpParams.set('busca', params.busca);
    }

    if (params?.acao) {
      httpParams = httpParams.set('acao', params.acao);
    }

    if (params?.componente) {
      httpParams = httpParams.set('componente', params.componente);
    }

    if (params?.atividadePrincipal) {
      httpParams = httpParams.set('atividadePrincipal', params.atividadePrincipal);
    }

    if (params?.subatividade) {
      httpParams = httpParams.set('subatividade', params.subatividade);
    }

    return this.http.get<TituloTarefaCatalogoDTO[]>(this.apiUrl, {
      params: httpParams,
    });
  }
}
