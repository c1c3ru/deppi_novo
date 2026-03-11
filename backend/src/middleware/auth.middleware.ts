import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        registration: string;
        roles: string[];
        [key: string]: unknown;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autenticação não fornecido',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Use the config secret (not a raw fallback string)
    const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload & {
      id: number;
      registration: string;
      roles: string[];
    };
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (
      !req.user.roles ||
      !roles.some((role) => req.user!.roles.includes(role))
    ) {
      return res
        .status(403)
        .json({ error: 'Acesso negado - Permissões insuficientes' });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Adds user to request if token is present, but doesn't fail if not
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload & {
        id: number;
        registration: string;
        roles: string[];
      };
      req.user = decoded;
    }

    next();
  } catch (_error) {
    // Don't fail, just continue without user
    next();
  }
};
