import { Router } from 'express';

import validateUUID from '../../middlewares/utils/validateUUID.js';
import hashPassword from '../../middlewares/utils/hashPassword.js';
import htmlSanitizer from '../../middlewares/utils/htmlSanitizer.js';
import validateSchema from '../../middlewares/joi/validateSchema.js';
import { AuthService } from '../../middlewares/utils/authService.js';
import { DataEncryptionService } from '../../middlewares/utils/dataEncryptionService.js';
import { AuthController } from '../controllers/authController.js';
import { createUserSchema } from '../../middlewares/joi/schemas/user.js';
import { loginSchema } from '../../middlewares/joi/schemas/auth.js';

export function createAuthRouter(
  controller: AuthController,
  authService: AuthService,
  encrypter: DataEncryptionService,
): Router {
  const router: Router = Router();

  router.post(
    '/auth/register',
    htmlSanitizer,
    validateSchema(createUserSchema),
    encrypter.encryptData,
    hashPassword,
    (req, res, next) => {
      controller.register(req, res, next);
    },
  );

  router.post(
    '/auth/login',
    htmlSanitizer,
    validateSchema(loginSchema),
    (req, res, next) => {
      controller.login(req, res, next);
    },
  );

  router.post('/auth/logout', (req, res, next) => {
    controller.logout(req, res, next);
  });

  router.get(
    '/auth/me',
    authService.setAuthUserRequest.bind(authService),
    (req, res, next) => {
      controller.getMe(req, res, next);
    },
  );

  router.get(
    '/auth/:userId/account',
    validateUUID,
    authService.checkPermission,
    (req, res, next) => {
      controller.getAccount(req, res, next);
    },
  );

  return router;
}
