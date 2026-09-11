import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class onlineGameService {
    gameId: string | null = null;


    clear(): void{
        this.gameId = null;
    }
}