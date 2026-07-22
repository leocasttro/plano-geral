import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { CriarUsuarioDTO, UsuarioDTO } from "./usuario.model";
import { Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class UsuarioApi {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  buscarTodos(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}`)
  }

  buscarTodosAdmin(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}/admin/all`);
  }

  criar(payload: CriarUsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/createUser`, payload);
  }

  alterarPerfil(id: string, perfil: string): Observable<UsuarioDTO> {
    return this.http.patch<UsuarioDTO>(`${this.apiUrl}/${id}/perfil`, { perfil });
  }

  alterarStatus(id: string, ativo: boolean): Observable<UsuarioDTO> {
    return this.http.patch<UsuarioDTO>(`${this.apiUrl}/${id}/status`, { ativo });
  }
}
