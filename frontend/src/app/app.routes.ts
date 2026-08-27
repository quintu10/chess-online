import { Routes } from '@angular/router';
import { MainMenu } from './components/main-menu/main-menu';
import { ChessBoard } from './components/chess-board/chess-board';
import { boardGuard } from './guards/board-guard';
import { GoogleRegister } from './components/google-register/google-register';

export const routes: Routes = [

    {
        path: '',
        component: MainMenu
    },
    {   
        path: 'board',
        component: ChessBoard,
        canActivate: [boardGuard]
    },
    {
        path: 'google-register',
        component: GoogleRegister
    },
];
