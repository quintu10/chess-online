import express from 'express';
import authRoutes from './routes/authRoutes';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Socket } from 'dgram';

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors:{
    origin: 'http://localhost:4200',
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado al Socket.IO', socket.id);

  socket.on('join-game', (gameId: string) => {
    socket.join(`game:${gameId}`);
  
    console.log(`Socket ${socket.id} se unio a la partida ${gameId}`)
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado', socket.id);
  });
});

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get('/', (req, res) => {
  console.log('Petición recibida');
  res.send('Express funcionando');
});

app.use('/auth', authRoutes);
app.use('/games', gameRoutes);

httpServer.listen(3000, '127.0.0.1', () => {
  console.log('Express escuchando en http://127.0.0.1:3000');
});

