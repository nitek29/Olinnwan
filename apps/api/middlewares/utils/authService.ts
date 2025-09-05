import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { jwtSchema } from '../joi/schemas/auth.js';
import { Config } from '../../config/config.js';
import status from 'http-status';
import { UserRepository } from '../repository/userRepository.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

export class AuthService {
  private config: Config;
  private jwtSecret: string;
  private userRepository: UserRepository;

  constructor() {
    this.config = Config.getInstance();
    this.jwtSecret = this.config.jwtSecret;
    this.userRepository = new UserRepository();

    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
  }

  public async setAuthUserRequest(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ) {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    try {
      // Vérification supplémentaire de sécurité
      if (!this.config || !this.config.jwtSecret) {
        throw new Error('JWT configuration is not available');
      }

      const { value, error } = jwtSchema.validate(
        jwt.verify(token, this.config.jwtSecret),
      );
      if (error) {
        return next(error);
      }

      req.userId = value.sub;

      next();
    } catch (error) {
      next(error);
    }
  }

  public async checkPermission(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    if (!req.userId) {
      res.status(status.UNAUTHORIZED).json({ error: 'Unautorized access' });
      return;
    }

    const tokenId = req.userId;
    const paramsId = req.params.userId;

    if (tokenId !== paramsId) {
      res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
      return;
    }

    next();
  }

  public async generateAccessToken(userId: string) {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET is not set');
    }

    return jwt.sign({ sub: userId }, this.jwtSecret, {
      expiresIn: '2h',
    });
  }

  // Middleware pour vérifier l'authentification et récupérer les infos utilisateur
  public async setAuthUserRequestWithRole(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ) {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    try {
      if (!this.config || !this.config.jwtSecret) {
        throw new Error('JWT configuration is not available');
      }

      const { value, error } = jwtSchema.validate(
        jwt.verify(token, this.config.jwtSecret),
      );
      if (error) {
        return next(error);
      }

      req.userId = value.sub;

      // Récupérer le rôle de l'utilisateur
      const user = await this.userRepository.getOne(value.sub);
      if (user) {
        req.userRole = user.role;
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  // Middleware pour vérifier si l'utilisateur est admin
  public async checkAdminRole(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    if (!req.userId) {
      res.status(status.UNAUTHORIZED).json({ error: 'Unauthorized access' });
      return;
    }

    if (!req.userRole || req.userRole !== 'admin') {
      res.status(status.FORBIDDEN).json({ error: 'Admin access required' });
      return;
    }

    next();
  }

  // Middleware pour vérifier si l'utilisateur est propriétaire OU admin
  public async checkOwnerOrAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    if (!req.userId) {
      res.status(status.UNAUTHORIZED).json({ error: 'Unauthorized access' });
      return;
    }

    const tokenId = req.userId;
    const paramsId = req.params.userId;
    const isAdmin = req.userRole === 'admin';

    // Si c'est un admin OU si c'est le propriétaire
    if (isAdmin || tokenId === paramsId) {
      next();
      return;
    }

    res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
  }
}
