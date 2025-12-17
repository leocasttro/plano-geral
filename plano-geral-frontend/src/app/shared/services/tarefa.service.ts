import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Tarefa {
  id?: number;
  titulo: string;
  descricao?: string;
  status?: string;
  responsavel?: string;
  urlImagem?: string;
  badgeClasseCor?: string;
  badgeTexto?: string;
  checklist?: any[];
  dataCriacao?: string;
}

@Injectable({ providedIn: 'root' })
export class TarefaService {
  private readonly apiUrl = `${environment.apiUrl}/tarefas`;

  constructor(private http: HttpClient) {}

  /** 🔹 Lista todas as tarefas */
  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl);
  }

  /** 🔹 Cria uma nova tarefa */
  criarTarefa(tarefa: Tarefa): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.apiUrl, tarefa);
  }

  /** 🔹 Atualiza uma tarefa */
  atualizar(id: number, tarefa: Partial<Tarefa>): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, tarefa);
  }

  /** 🔹 Remove uma tarefa */
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
