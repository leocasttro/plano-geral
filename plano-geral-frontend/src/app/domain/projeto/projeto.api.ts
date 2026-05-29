import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CriarProjetoRequest, ProjetoDTO} from './projetoModel';

@Injectable({ providedIn: 'root' })

export class ProjetoApi {
  private readonly apiUrl = `${environment.apiUrl}/projetos`;

  constructor(private http: HttpClient) {
  }

  buscarTodos(): Observable<ProjetoDTO[]> {
    return this.http.get<ProjetoDTO[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<ProjetoDTO> {
    return this.http.get<ProjetoDTO>(`${this.apiUrl}/${id}`);
  }

  criar(payload: CriarProjetoRequest): Observable<ProjetoDTO> {
    return this.http.post<ProjetoDTO>(this.apiUrl, payload);
  }

  atualizarStatus(id: string, status: string): Observable<ProjetoDTO> {
    return this.http.patch<ProjetoDTO>(`${this.apiUrl}/${id}/status`, { status });
  }
}
