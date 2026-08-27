import express from 'express';
import authRoutes from './routes/authRoutes';
import cookieParser from 'cookie-parser';
import passport from './config/passport';
import cors from 'cors'

const app = express();

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

app.listen(3000, '127.0.0.1', () => {
  console.log('Express escuchando en http://127.0.0.1:3000');
});