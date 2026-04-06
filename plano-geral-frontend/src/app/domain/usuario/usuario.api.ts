import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { UsuarioDTO } from "./usuario.model";
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
}
