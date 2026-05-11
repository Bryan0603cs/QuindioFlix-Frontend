import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/api.models';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as RolUsuario[];
  return auth.hasRole(roles) ? true : router.createUrlTree(['/dashboard']);
};
