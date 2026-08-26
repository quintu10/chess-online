import { Request, Response } from 'express';
import { createUser,loginUser,getCurrentUser,logOutUser } from '../services/userService';

export function register(req: Request, res: Response) {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({
      message: 'Email, username y password son obligatorios'
    });
  }

  return createUser(email, username, password)
    .then(result => {
      res.status(201).json({
        message: 'Usuario creado correctamente',
        user: result.rows[0]
      });
    })
    .catch(error => {
      console.error(error);

      if (error.code === '23505') {
        return res.status(409).json({
          message: 'El email o username ya está registrado'
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