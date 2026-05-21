import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

export const perfilGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const data = inject(DataService);
  const router = inject(Router);
  if (auth.getPerfilActivo()) return true;

  const userId = auth.currentUser()?.id;
  if (!userId) return router.createUrlTree(['/login']);

  return data.perfiles(userId).pipe(
    map(perfiles => {
      if (perfiles.length === 1) {
        auth.setPerfilActivo(perfiles[0]);
        return true;
      }
      return router.createUrlTree(['/perfiles']);
    }),
    catchError(() => of(router.createUrlTree(['/perfiles'])))
  );
};
