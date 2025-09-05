import { Router } from 'express';

import validateUUID from '../../middlewares/utils/validateUUID.js';
import htmlSanitizer from '../../middlewares/utils/htmlSanitizer.js';
import validateSchema from '../../middlewares/joi/validateSchema.js';
import {
  AuthService,
  AuthenticatedRequest,
} from '../../middlewares/utils/authService.js';
import { EventController } from '../controllers/eventController.js';
import {
  createEventSchema,
  updateEventSchema,
} from '../../middlewares/joi/schemas/event.js';

export function createEventRouter(
  controller: EventController,
  authService: AuthService,
): Router {
  const router: Router = Router();

  router.get('/events', (req, res, next) => {
    controller.getAll(req, res, next);
  });

  router.get('/events/enriched', (req, res, next) => {
    controller.getAllEnriched(req, res, next);
  });

  router.get('/event/:eventId', validateUUID, (req, res, next) => {
    controller.getOne(req, res, next);
  });

  router.get('/event/:eventId/enriched', validateUUID, (req, res, next) => {
    controller.getOneEnriched(req, res, next);
  });

  router.post(
    '/event/:eventId/addCharacters',
    validateUUID,
    htmlSanitizer,
    (req, res, next) => {
      controller.addCharactersToEvent(req, res, next);
    },
  );

  router.post(
    '/event/:eventId/removeCharacters',
    validateUUID,
    htmlSanitizer,
    (req, res, next) => {
      controller.removeCharactersFromEvent(req, res, next);
    },
  );

  // Admin-specific event routes
  router
    .route('/user/:userId/event/:eventId')
    .patch(
      validateUUID,
      authService.setAuthUserRequestWithRole.bind(authService),
      authService.checkOwnerOrAdmin.bind(authService),
      htmlSanitizer,
      validateSchema(updateEventSchema),
      (req: AuthenticatedRequest, res, next) => {
        console.log('Admin update event');
        // Si c'est un admin, utiliser la méthode admin, sinon la méthode normale
        if (req.userRole === 'admin' && req.userId !== req.params.userId) {
          controller.adminUpdateEvent(req, res, next);
        } else {
          controller.update(req, res, next);
        }
      },
    )
    .delete(
      validateUUID,
      authService.setAuthUserRequestWithRole.bind(authService),
      authService.checkOwnerOrAdmin.bind(authService),
      (req: AuthenticatedRequest, res, next) => {
        // Si c'est un admin, utiliser la méthode admin, sinon la méthode normale
        if (req.userRole === 'admin' && req.userId !== req.params.userId) {
          controller.adminDeleteEvent(req, res, next);
        } else {
          controller.delete(req, res, next);
        }
      },
    );

  router.post(
    '/user/:userId/event',
    validateUUID,
    authService.checkPermission,
    htmlSanitizer,
    validateSchema(createEventSchema),
    (req, res, next) => {
      controller.post(req, res, next);
    },
  );

  router.post(
    '/events',
    authService.setAuthUserRequest.bind(authService),
    htmlSanitizer,
    validateSchema(createEventSchema),
    (req, res, next) => {
      controller.createEvent(req, res, next);
    },
  );

  router
    .route('/event/:eventId')
    .patch(
      validateUUID,
      authService.setAuthUserRequest.bind(authService),
      authService.checkOwnerOrAdmin.bind(authService),
      htmlSanitizer,
      validateSchema(updateEventSchema),
      (req, res, next) => {
        controller.update(req, res, next);
      },
    )
    .delete(
      validateUUID,
      authService.setAuthUserRequest.bind(authService),
      (req, res, next) => {
        controller.delete(req, res, next);
      },
    );

  return router;
}
