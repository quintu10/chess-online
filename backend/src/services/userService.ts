import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../config/database';

export function createUser(
  email: string,
  username: string,
  password: string
) {
  return bcrypt.hash(password, 10)
    .then(passwordHash => {
      return pool.query(
        `INSERT INTO users (email, username, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, username, avatar, created_at`,
        [email, username, passwordHash]
      );
    });   
}

export function loginUser(
  email: string,
  password: string
) {
  return pool.query(
    `SELECT id, email, username, password_hash, avatar
     FROM users
     WHERE email = $1`,
    [email]
  )
  .then(result => {
    if (result.rows.length === 0) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    return bcrypt.compare(password, user.password_hash)
      .then(isValid => {
        if (!isValid) {
          throw new Error('INVALID_CREDENTIALS');
        }

        const token = crypto.randomBytes(32).toString('hex');

        const tokenHash = crypto
          .createHash('sha256')
          .update(token)
          .digest('hex');

        return pool.query(
          `INSERT INTO sessions (user_id, token_hash, expires_at)
           VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
          [user.id, tokenHash]
        )
        .then(() => ({
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatar: user.avatar
          }
        }));
      });
  });
}

export function getCurrentUser(token: string) {
    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'); 

    return pool.query(
        `SELECT
            users.id,
            users.email,
            users.username,
            users.avatar
        FROM sessions
        INNER JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = $1
            AND sessions.expires_at > NOW()`,
        [tokenHash]
    )
    .then(result =>{
        if(result.rows.length === 0){
            throw new Error('INVALID SESSION');
        }

        return result.rows[0];
    });

}

export function logOutUser(token: string) {
    const tokenHash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'); 

    return pool.query(
        `DELETE
        FROM sessions
        WHERE sessions.token_hash = $1`,
        [tokenHash]
    )

}