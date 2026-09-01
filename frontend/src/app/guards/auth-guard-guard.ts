import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router= inject(Router);

  return http.get<any>(
    'http://localhost:3000/auth/me',
  {
    withCredentials: true
  }
  ).pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
  
};
