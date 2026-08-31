import { Request, Response } from 'express';
import { createUser,loginUser,getCurrentUser,logOutUser,
         findUserByEmail, findUserByGoogleId, linkGoogleAccount,
         createSession,createGooglePendingUser, 
         getGooglePendingUser, completeGoogleRegistration
} from '../services/userService';
import { error } from 'console';
import passport from 'passport';


export function register(req: Request, res: Response) {
  const { email, username, password, avatar } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({
      message: 'Email, username y password son obligatorios'
    });
  }

  return createUser(email, username, password, avatar || null)
    .then(result => {
      res.status(201).json({
        message: 'Usuario creado correctamente',
        user: result.rows[0]
      });
    })
    .catch(error => {
      console.error(error);

      if (error.code === '23505') {
        
        if (error.constraint === 'users_email_key') { 
          return res.status(409).json({ 
            message: 'El email ya está registrado' });
          } 
        
        if (error.constraint === 'users_username_key') {
          return res.status(409).json({ 
            message: 'El nombre de usuario ya está en uso' }); 
          }
        
        return res.status(409).json({
          message: 'El email o el nombre de usuario ya está registrado'
        });
      }

      return res.status(500).json({
        message: 'Error interno del servidor'
      });
    });
}

export function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email y password son obligatorios'
    });
  }

  return loginUser(email, password)
    .then(result => {
      res.cookie('session', result.token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        message: 'Inicio de sesión exitoso',
        user: result.user
      });
    })
    .catch(error => {
      if (error.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({
          message: 'Email o contraseña incorrectos'
        });
      }

      console.error(error);

      return res.status(500).json({
        message: 'Error interno del servidor'
      });
    });
}

export function me(req: Request, res: Response) {
  console.log('COOKIES:', req.cookies);
  console.log('SESSION:', req.cookies.session);
  const token = req.cookies.session;

  if (!token) {
    return res.status(401).json({
      message: 'No hay una sesión activa'
    });
  }

  return getCurrentUser(token)
    .then(user => {
      res.json({
        user
      });
    })
    .catch(error => {
      if (error.message === 'INVALID_SESSION') {
        return res.status(401).json({
          message: 'Sesión inválida o expirada'
        });
      }

      console.error(error);

      return res.status(500).json({
        message: 'Error interno del servidor'
      });
    });
}

export function logout(req: Request, res: Response) {
  const token = req.cookies.session;

  if (!token) {
    return res.status(204).send();
  }

  return logOutUser(token)
    .then(user => {
      res.clearCookie('session', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
      });
      return res.status(204).send();
    })
    .catch(error => {
      
      console.error(error);

      return res.status(500).json({
        message: 'Error interno del servidor'
      });
    });
}

export function googleCallback(req: Request, res: Response): void {
  const profile = req.user as any;

  const googleId = profile.id;
  const email = profile.emails?.[0]?.value;
  const avatar = profile.photos?.[0]?.value || null;

  if (!googleId || !email) {
    res.status(400).json({
      message: 'Google no devolvio los datos necesarios'
    });
    return;
  }

  findUserByGoogleId(googleId)
    .then(user => {

      // CASO 1:
      // Ya existe el usuario y ya tiene Google vinculado
      if (user) {
        return createSession(user.id)
          .then(token => {

            res.cookie('session', token, {
              httpOnly: true,
              secure: false,
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.redirect('http://localhost:4200/board');
          });
      }

      // CASO 2 y 3:
      // Google no está vinculado, buscamos por email
      return findUserByEmail(email)
        .then(existingUser => {

          // CASO 2:
          // Existe una cuenta normal con ese email
          if (existingUser) {
            return linkGoogleAccount(
              existingUser.id,
              googleId,
              avatar
            )
              .then(user => {
                return createSession(user.id)
                  .then(token => {

                    res.cookie('session', token, {
                      httpOnly: true,
                      secure: false,
                      sameSite: 'lax',
                      maxAge: 7 * 24 * 60 * 60 * 1000
                    });

                    res.redirect('http://localhost:4200/board');
                  });
              });
          }

          // CASO 3:
          // No existe ninguna cuenta con ese email
          return createGooglePendingUser(
            googleId,
            email,
            avatar
          )
            .then(token => {

              res.redirect(
                `http://localhost:4200/google-register?token=${token}`
              );
            });
        });
    })
    .catch(error => {

      console.error(error);

      if (!res.headersSent) {
        res.redirect('http://localhost:4200/login?error=google');
      }
    });
}

export function getGooglePending(req: Request, res: Response){
  const token = req.query.token;

  if(typeof token !== 'string' || !token){
    return res.status(400).json({
      message: 'token invalido'
    });
  }

  return getGooglePendingUser(token)
    .then(user => {
      return res.json({
        email: user.email,
        avatar: user.avatar
      });
    })
    .catch(error => { 
      if(error.message === 'INVALID_GOOGLE_PENDING_TOKEN'){
        return res.status(400).json({
          message: 'El registro de google expiro o no es valido'
        });
      }
      
      console.error(error);
    
      return res.status(500).json({
        message: 'Error obteniendo los datos de google'
      });
  });
}

export function completeGoogleRegister(req: Request, res: Response){
  const {token, username, password} = req.body;

  if(!token || !username || !password){
    return res.status(400).json({
      message: 'Token y username son obligatorios'
    });
  }

  return completeGoogleRegistration(token, username, password)
    .then(result => {
      res.cookie('session', result.token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({
        message: 'Cuenta creada correctamente',
        user: result.user
      });
    })
    .catch(error => {
      if(error.message === 'INVALID_GOOGLE_PENDING_TOKEN'){
        return res.status(401).json({
          message: 'El registro de google expiro o no es valido'
        });
      }

      if(error.code === '23505'){
        return res.status(409).json({
          message: 'El nombre de usuario ya esta en uso'
        });
      }

      console.error(error);

      return res.status(500).json({
        message: 'Error creando la cuenta'
      });
    });
}