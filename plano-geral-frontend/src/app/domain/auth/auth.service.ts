import {Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {LoginRequest, LoginResponse} from './auth.types';
import {tap} from 'rxjs';
import {UsuarioDTO} from '../usuario/usuario.model';

type JwtPayload = {
  sub: string;
  perfil: string;
  exp?: number;
  iat?: number;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  usuario = signal<UsuarioDTO | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    if (this.hasValidToken()) {
      this.usuario.set(this.getStoreUser());
    } else {
      this.clearSession(false);
    }
  }

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.usuario.set(response.user);
      })
    );
  }

  logout() {
    this.clearSession();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  hasValidToken(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    return !this.isTokenExpired(token);
  }

  isTokenExpired(token: string | null = this.getToken()): boolean {
    if (!token) {
      return true;
    }

    const payload = this.decodeToken(token);

    if (!payload?.exp) {
      return true;
    }

    const agoraEmSegundos = Math.floor(Date.now() / 1000);

    return payload.exp <= agoraEmSegundos;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const [, payload] = token.split('.');

      if (!payload) {
        return null;
      }

      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((char) => {
            return `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`;
          })
          .join(''),
      );

      return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
      return null;
    }
  }

  private getStoreUser(): UsuarioDTO | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  private clearSession(redirect = true) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.usuario.set(null);

    if (redirect) {
      this.router.navigate(['/login']);
    }
  }
}
