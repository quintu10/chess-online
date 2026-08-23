import { Injectable } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root',
})
export class Session {

  playerName : string | null = null;
  gameMode : 'offline' | 'online' | null = null;
  
  hasActivatedSession(): boolean{
    return this.playerName !== null && this.gameMode !== null;
  }

  clear():void{
    this.playerName = null;
    this.gameMode = null;
  }

}
