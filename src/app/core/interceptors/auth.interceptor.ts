import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  const token = localStorage.getItem('qf_token');
  const request = !token || req.headers.has('Authorization')
    ? req
    : req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(request).pipe(catchError((error) => {
    const status = error?.status;
    const message = error?.error?.message || error?.error?.detail || error?.error?.error || 'No fue posible completar la operación.';
    if (status === 401) {
      toast.show('Tu sesión expiró o no está autorizada.', 'error');
      router.navigateByUrl('/login');
    } else if (status !== 0) {
      toast.show(message, 'error');
    } else {
      toast.show('No hay conexión con el backend.', 'error');
    }
    return throwError(() => error);
  }));
};
