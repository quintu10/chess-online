import express from 'express';
import authRoutes from './routes/authRoutes';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log('Petición recibida');
  res.send('Express funcionando');
});

app.use('/auth', authRoutes);

app.listen(3000, '127.0.0.1', () => {
  console.log('Express escuchando en http://127.0.0.1:3000');
});