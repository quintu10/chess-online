import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";

@Injectable({
    providedIn: 'root'
})
export class SocketService{
    
    private socket: Socket;

    constructor(){
        this.socket = io('http://localhost:3000', {
            withCredentials: true
        });
    }

    getSocket():Socket{
        return this.socket
    }

    identifyUser(userId: string):void{
        this.socket.emit('identify-user', userId);
    }

    joinGame(gameId: string):void {
        this.socket.emit('join-game', gameId);
    }

    onMatchFound(callback: (game: any) => void):void{
        console.log('ESCUCHANDO MATCH-FOUND');
        
        this.socket.on('match-found', callback);
    } 
}