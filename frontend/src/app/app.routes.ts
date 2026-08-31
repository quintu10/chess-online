import { Routes } from '@angular/router';
import { MainMenu } from './components/main-menu/main-menu';
import { ChessBoard } from './components/chess-board/chess-board';
import { boardGuard } from './guards/board-guard';
import { GoogleRegister } from './components/google-register/google-register';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Home } from './components/home/home';

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
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'home',
        component: Home
    }
];
