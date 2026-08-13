import { Routes } from '@angular/router';
import { MainMenu } from './components/main-menu/main-menu';
import { ChessBoard } from './components/chess-board/chess-board';

export const routes: Routes = [

    {
        path: '',
        component: MainMenu
    },
    {
        path: 'jugar-local',
        component: ChessBoard
    }
];
