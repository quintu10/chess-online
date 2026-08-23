import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Session } from '../services/session';

export const boardGuard: CanActivateFn = () => {
  const sesionService = inject(Session);
  const router = inject(Router);

  if(sesionService.hasActivatedSession()){
    return true;
  }else
    return router.createUrlTree(['/']);
};
