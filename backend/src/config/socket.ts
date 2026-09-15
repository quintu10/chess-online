import { Server } from "socket.io";


let io: Server;

export function setSocketIO(socketIO: Server){
    console.log('SET SOCKET IO:', socketIO ? 'OK' : 'UNDEFINED');
    io = socketIO;
}

export function getSocketIO():Server{
    console.log('GET SOCKET IO:', io ? 'OK' : 'UNDEFINED')
    return io;
}