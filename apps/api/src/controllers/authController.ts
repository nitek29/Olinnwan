import status from 'http-status';
import argon2 from 'argon2';
import { NextFunction, Request, Response } from 'express';

import { AuthenticatedRequest } from '../../middlewares/utils/authService.js';
import { AuthUser } from '../../types/user.js';
import { authUserSchema } from '../../middlewares/joi/schemas/auth.js';
import { AuthRepository } from '../../middlewares/repository/authRepository.js';
import { AuthService } from '../../middlewares/utils/authService.js';

export class AuthController {
  private service: AuthService;
  private repository: AuthRepository;

  public constructor(service: AuthService, repository: AuthRepository) {
    this.service = service;
    this.repository = repository;
  }

  public async register(req: Request, res: Response, next: NextFunction) {
    const username = req.body.username;

    try {
      const isExist: AuthUser | null =
        await this.repository.findOneByUsername(username);

      if (isExist) {
        res.status(status.CONFLICT).json({ error: 'Username forbidden' });
        return;
      }

      req.body.role = 'user';

      const newUser: AuthUser = await this.repository.register(req.body);

      res.status(status.CREATED).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;

    try {
      const user: AuthUser | null =
        await this.repository.findOneByUsername(username);

      if (!user) {
        res
          .status(status.UNAUTHORIZED)
          .json({ error: 'Username or password unavailable' });
        return;
      }

      const isPasswordMatch = await argon2.verify(user.password, password);

      if (!isPasswordMatch) {
        res
          .status(status.UNAUTHORIZED)
          .json({ error: 'Username or password unavailable' });
        return;
      }

      const accessToken = await this.service.generateAccessToken(user.id);
      const { password: _password, ...userWithoutPassword } = user;

      res
        .cookie('token', accessToken, {
          httpOnly: true, // Prevents access via JavaScriptt (XSS protection)
          // TODO swap to true
          secure: false, // Use HTTPS in production
          sameSite: 'strict', // CRSF protection
          maxAge: 7200000, // Life time (2h)
        })
        .json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  public async getAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { value, error } = authUserSchema.validate({ userId: req.userId });

      if (error) {
        res
          .status(status.BAD_REQUEST)
          .json({ message: 'Invalid or missing user ID' });
        return;
      }

      const id = value.userId;

      const user = await this.repository.findOneById(id);

      if (!user) {
        res.status(status.NOT_FOUND).json({ message: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  public logout(_req: Request, res: Response, _next: NextFunction) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    res.json({ message: 'Successfully logout' });
  }

  public async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        res.status(status.UNAUTHORIZED).json({ message: 'Not authenticated' });
        return;
      }

      const user = await this.repository.findOneById(req.userId);

      if (!user) {
        res.status(status.NOT_FOUND).json({ message: 'User not found' });
        return;
      }

      // Retourner l'utilisateur sans le mot de passe
      const { password: _password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
}
