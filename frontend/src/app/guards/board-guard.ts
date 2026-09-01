import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Session } from '../services/session';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export const boardGuard: CanActivateFn = () => {
  const sesionService = inject(Session);
  const router = inject(Router);
  const http = inject(HttpClient);

  return http.get<any>(
    'http://localhost:3000/auth/me',
    {
      withCredentials: true
    }
  )
  .pipe(
    map(response =>{
      sesionService.playerName === response.user.username;

      if(sesionService.gameMode === null){
        sesionService.gameMode = 'offline';
      }

      return true;
    }),

    catchError(() =>{

      if(sesionService.hasActivatedSession()){
        return of(true);
      }

      return of(router.createUrlTree(['/']));
    })
  );

};
