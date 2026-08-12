import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  if (isApiRequest && token && authService.isTokenExpired(token)) {
    authService.logout();

    return throwError(() => new Error('Token expirado'));
  }

  const authReq = token && isApiRequest
    ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isApiRequest && error.status === 401 && token) {
        authService.logout();
      }

      return throwError(() => error);
    }),
  );
};
