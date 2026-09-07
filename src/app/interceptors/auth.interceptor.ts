import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenData = authService.getToken();

  let authReq = req;
  if (tokenData && tokenData.token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${tokenData.token}`,
        'X-User-Id': tokenData.userId || ''
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If webservice receives error code 401 (Unauthorized), directly logout and redirect
      if (error.status === 401) {
        console.warn('401 Unauthorized received from API endpoint. Redirecting to login...');
        authService.logout('https://www.carbonovaworld.com/login.php');
      }
      return throwError(() => error);
    })
  );
};
