import { QueryResult } from 'pg';
import { pool } from './config/database';

pool.query('SELECT NOW()')
  .then((result: QueryResult) => {
    console.log('Conexión exitosa con PostgreSQL');
    console.log('Hora del servidor:', result.rows[0].now);
  })
  .catch((error: Error) => {
    console.error('Error conectando con PostgreSQL:', error);
  });