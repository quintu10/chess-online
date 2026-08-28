import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../config/database';
import { queryObjects } from 'v8';
import { Result } from 'pg';
import { error } from 'console';
import { session } from 'passport';

interface User {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
}

export function createUser(
  email: string,
  username: string,
  password: string,
  avatar: string | null = null
) {
  return bcrypt.hash(password, 10)
    .then(passwordHash => {
      return pool.query(
        `INSERT INTO users (email, username, password_hash, avatar)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, username, avatar, created_at`,
        [email, username, passwordHash, avatar]
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

        return createSession(user.id)
          .then(token => ({
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
            throw new Error('INVALID_SESSION');
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

export function findUserByGoogleId(googleId: string): Promise<User | null> {
  return pool.query(
    `SELECT id, email, username, avatar
     FROM users
     WHERE google_id = $1`,
    [googleId]
  )
  .then(result => {
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  });
}

export function findUserByEmail(email: string): Promise<User | null> {
  return pool.query(
    `SELECT id, email, username, avatar, google_id
     FROM users
     WHERE email = $1`,
    [email]
  )
  .then(result => {
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  });
}

export function createGoogleUser(
  googleId: string,
  email: string,
  username: string,
  avatar: string | null
) {
  return pool.query(
    `INSERT INTO users
      (email, username, password_hash, avatar, google_id)
     VALUES ($1, $2, NULL, $3, $4)
     RETURNING id, email, username, avatar`,
    [email, username, avatar, googleId]
  );
}

export function linkGoogleAccount(
  userId: string,
  googleId: string,
  avatar: string | null
) {
  return pool.query(
    `UPDATE users
     SET google_id = $1,
         avatar = COALESCE($2, avatar),
         updated_at = NOW()
     WHERE id = $3
     RETURNING id, email, username, avatar`,
    [googleId, avatar, userId]
  )
  .then(result => result.rows[0]);
}

export function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');

  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return pool.query(
    `INSERT INTO sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [userId, tokenHash]
  )
  .then(() => token);
}

export function loginWithGoogle(
  googleId: string,
  email: string,
  username: string,
  avatar: string|null
) {
  
  return pool.query(
    `SELECT id, email, username, avatar
    FROM users
    WHERE google_id = $1`,
    [googleId]
  )
  .then(result =>{
    if(result.rows.length > 0){
      return result.rows[0];
    }

    return pool.query(
      `SELECT id, email, username, avatar
      FROM users 
      WHERE email = $1`,
      [email]
    )
  })
  .then(result  =>{
    if(result.rows.length > 0){
      const user = result.rows[0];

      return pool.query(
        `UPDATE users
        SET google_id = $1,
            update_at =  NOW()
        WHERE id = $2
        RETURNING id, email, username, avatar`,
        [googleId, user.id]
      )
      .then(result => result.rows[0]);
    }

    return pool.query(
      `INSERT INTO users
        (email, username, password_hash, avatar, google_id )
      VALUES($1, $2, NULL, $3, $4)
      RETURNING email, username, avatar, google_id`,
      [email, username, avatar, googleId]
    )
    .then(result => result.rows[0]);
  })
  .then(user => {
    const token = crypto.randomBytes(32).toString('hex');

    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    return pool.query(
      `INSERT INTO sessions
        (user_id, token_hash, expires_at)
      VALUES($1, $2, NOW())`,
      [user.id, tokenHash]
    )
    .then(() => ({
      token, 
      user
    }));
  });

}

export function createGooglePendingUser(googleId: string, email: string, avatar: string | null){
  const token = crypto.randomBytes(32).toString('hex');

  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

    return pool.query(
      `INSERT INTO google_pending_users
        (token_hash, google_id, email, avatar, expires_at)
      VALUES($1,$2,$3,$4, NOW() + INTERVAL '10 minutes')`,
      [tokenHash, googleId, email, avatar]
    )
    .then(() => token);
}

export function getGooglePendingUser(token: string){
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return pool.query(
    `SELECT google_id, email, avatar
    FROM google_pending_users
    WHERE token_hash = $1
      AND expires_at > NOW()`,
    [tokenHash]
  )
  .then(result => {
    if(result.rows.length === 0){
      throw new Error('INVALID_GOOGLE_PENDING_TOKEN');
    }

    return result.rows[0];
  });
}

export function completeGoogleRegistration(token: string, username: string, password: string){
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return pool.query(
    `SELECT google_id, email, avatar
    FROM google_pending_users
    WHERE token_hash = $1
      AND expires_at > NOW()`,
    [tokenHash]
  )
  .then(result => {
    if(result.rows.length === 0){
      throw new Error('INVALID_GOOGLE_PENDING_TOKEN');
    }

    const pendingUser = result.rows[0];

    return bcrypt.hash(password,10)
    .then(passwordHash => {
      return pool.query(
        `INSERT INTO users
        (email, username, password_hash, avatar, google_id)
        VALUES($1, $2, $3, $4, $5)
        RETURNING id, email, username, avatar`,
        [pendingUser.email, username, passwordHash,pendingUser.avatar, pendingUser.google_id]
      );
    });
  })
  .then(result => {
    const user = result.rows[0];

    return pool.query(
      `DELETE FROM google_pending_users
      WHERE token_hash = $1`,
      [tokenHash]
    )
    .then(() => createSession(user.id))
    .then(sessionToken => ({
      token: sessionToken,
      user
    }));
  });
}