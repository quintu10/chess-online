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

    joinGame(gameId: string):void {
        this.socket.emit('join-game', gameId);
    }
}