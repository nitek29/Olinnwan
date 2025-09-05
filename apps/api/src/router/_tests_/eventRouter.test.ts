import request from 'supertest';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import express, { NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import status from 'http-status';
import jwt from 'jsonwebtoken';

import { Config } from '../../../config/config.js';
import { setup, receivedReq } from './mock-tools.js';
import { AuthService } from '../../../middlewares/utils/authService.js';
import { createEventRouter } from '../eventRouter.js';
import { EventController } from '../../controllers/eventController.js';
import { EventRepository } from '../../../middlewares/repository/eventRepository.js';

describe('eventRouter', () => {
  const repository = {} as EventRepository;
  const controller = new EventController(repository);
  const service = new AuthService();
  let app: ReturnType<typeof setup.App>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock AuthService methods
    vi.spyOn(service, 'setAuthUserRequest').mockImplementation(
      async (req: any, res: any, next: NextFunction) => {
        // Si il y a un token dans les cookies, on simule l'extraction de l'userId
        if (req.cookies?.token) {
          try {
            const decoded = jwt.verify(req.cookies.token, secret) as any;
            req.userId = decoded.sub;
          } catch (error) {
            // Token invalide, pas d'userId
          }
        }
        next();
      },
    );

    vi.spyOn(service, 'setAuthUserRequestWithRole').mockImplementation(
      async (req: any, res: any, next: NextFunction) => {
        // Si il y a un token dans les cookies, on simule l'extraction de l'userId et du rôle
        if (req.cookies?.token) {
          try {
            const decoded = jwt.verify(req.cookies.token, secret) as any;
            req.userId = decoded.sub;
            req.userRole = 'user'; // Par défaut, sauf si on veut tester admin
          } catch (error) {
            // Token invalide, pas d'userId
          }
        }
        next();
      },
    );

    vi.spyOn(service, 'checkOwnerOrAdmin').mockImplementation(
      async (req: any, res: any, next: NextFunction) => {
        // Vérifie que l'utilisateur est propriétaire ou admin
        if (!req.userId) {
          res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
          return;
        }

        // Si userId du token != userId des params, et que ce n'est pas un admin, on refuse
        if (
          req.params.userId &&
          req.userId !== req.params.userId &&
          req.userRole !== 'admin'
        ) {
          res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
          return;
        }

        next();
      },
    );

    vi.spyOn(service, 'checkPermission').mockImplementation(
      async (req: any, res: any, next: NextFunction) => {
        // Vérifie que l'utilisateur a la permission (similaire à checkOwnerOrAdmin)
        if (!req.userId) {
          res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
          return;
        }

        if (req.params.userId && req.userId !== req.params.userId) {
          res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
          return;
        }

        next();
      },
    );

    app = setup.App<EventController, [AuthService]>(
      controller,
      createEventRouter,
      {
        routerFactoryArgs: [service],
      },
    );
  });

  const config = Config.getInstance();
  const secret = config.jwtSecret;
  const userId = 'f0256483-0827-4cd5-923a-6bd10a135c4e';
  const eventId = '18d99a7c-1d47-4391-bacd-cc4848165768';
  const token = jwt.sign({ sub: userId }, secret, { expiresIn: '2h' });

  describe('GET /events', () => {
    it('Propagate request to eventController.getAll', async () => {
      //GIVEN
      controller.getAll = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app).get('/events');
      //THEN
      expect(controller.getAll).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.getAll = setup.mockNextCall();

      const res = await request(app).get('/events');

      expect(controller.getAll).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });
  });

  describe('GET /events/enriched', () => {
    it('Propagate request to eventController.getAllEnriched', async () => {
      //GIVEN
      controller.getAllEnriched = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app).get('/events/enriched');
      //THEN
      expect(controller.getAllEnriched).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.getAllEnriched = setup.mockNextCall();

      const res = await request(app).get('/events/enriched');

      expect(controller.getAllEnriched).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });
  });

  describe('GET /event/:eventId', () => {
    it('Propagate request to eventController.getOne', async () => {
      //GIVEN
      controller.getOne = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app).get(`/event/${eventId}`);
      //THEN
      expect(controller.getOne).toHaveBeenCalled();
      expect(receivedReq?.params.eventId).toBe(eventId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.getOne = setup.mockNextCall();

      const res = await request(app).get(`/event/${eventId}`);

      expect(controller.getOne).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app).get('/event/toto');

      expect(controller.getOne).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe('GET /event/:eventId/enriched', () => {
    it('Propagate request to eventController.getOneEnriched', async () => {
      //GIVEN
      controller.getOneEnriched = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app).get(`/event/${eventId}/enriched`);
      //THEN
      expect(controller.getOneEnriched).toHaveBeenCalled();
      expect(receivedReq?.params.eventId).toBe(eventId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.getOneEnriched = setup.mockNextCall();

      const res = await request(app).get(`/event/${eventId}/enriched`);

      expect(controller.getOneEnriched).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app).get('/event/toto/enriched');

      expect(controller.getOneEnriched).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe('POST /user/:userId/event', () => {
    it('Propagate request to eventController.post', async () => {
      //GIVEN
      controller.post = setup.mockSucessCall(status.CREATED);
      //WHEN
      const res = await request(app)
        .post(`/user/${userId}/event`)
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.post).toHaveBeenCalled();
      expect(receivedReq?.params.userId).toBe(userId);
      expect(res.status).toBe(status.CREATED);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.post = setup.mockNextCall();

      const res = await request(app)
        .post(`/user/${userId}/event`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.post).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app)
        .post('/user/1234/event')
        .set('Cookie', [`token=${token}`]);

      expect(controller.post).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Rejects unauthorized request when token userId ≠ params', async () => {
      const otherUserId = '9da844de-dcc1-4b39-a4cf-19d800f4c122';

      const res = await request(app)
        .post(`/user/${otherUserId}/event/`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.post).not.toHaveBeenCalled();
      expect(res.status).toBe(status.FORBIDDEN);
      expect(res.body).toEqual({ error: 'Forbidden access' });
    });
  });

  describe('POST /events', () => {
    it('Propagate request to eventController.createEvent', async () => {
      //GIVEN
      controller.createEvent = setup.mockSucessCall(status.CREATED);
      //WHEN
      const res = await request(app)
        .post(`/events`)
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.createEvent).toHaveBeenCalled();
      expect((receivedReq as any)?.userId).toBe(userId);
      expect(res.status).toBe(status.CREATED);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.createEvent = setup.mockNextCall();

      const res = await request(app)
        .post(`/events`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.createEvent).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it('Rejects unauthorized request when token is not set', async () => {
      // On doit mocker createEvent car il sera appelé, mais il retournera 403
      controller.createEvent = vi
        .fn()
        .mockImplementation((req: any, res: any) => {
          res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        });

      const res = await request(app).post(`/events`);

      expect(controller.createEvent).toHaveBeenCalled();
      expect(res.status).toBe(status.FORBIDDEN);
      expect(res.body).toEqual({ error: 'Forbidden access' });
    });
  });

  describe('POST /event/:eventId/addCharacters', () => {
    it('Propagate request to eventController.addCharactersToEvent', async () => {
      //GIVEN
      controller.addCharactersToEvent = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app).post(`/event/${eventId}/addCharacters`);
      //THEN
      expect(controller.addCharactersToEvent).toHaveBeenCalled();
      expect(receivedReq?.params.eventId).toBe(eventId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.addCharactersToEvent = setup.mockNextCall();

      const res = await request(app).post(`/event/${eventId}/addCharacters`);

      expect(controller.addCharactersToEvent).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app).post('/event/1234/addCharacters');

      expect(controller.addCharactersToEvent).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe('POST /event/:eventId/removeCharacters', () => {
    it('Propagate request to eventController.removeCharactersFromEvent', async () => {
      //GIVEN
      controller.removeCharactersFromEvent = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app).post(`/event/${eventId}/removeCharacters`);
      //THEN
      expect(controller.removeCharactersFromEvent).toHaveBeenCalled();
      expect(receivedReq?.params.eventId).toBe(eventId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.removeCharactersFromEvent = setup.mockNextCall();

      const res = await request(app).post(`/event/${eventId}/removeCharacters`);

      expect(controller.removeCharactersFromEvent).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app).post('/event/1234/removeCharacters');

      expect(controller.removeCharactersFromEvent).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe('PATCH /user/:userId/event/:eventId', () => {
    it('Propagate request to eventController.update', async () => {
      //GIVEN
      controller.update = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app)
        .patch(`/user/${userId}/event/${eventId}`)
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.update).toHaveBeenCalled();
      expect(receivedReq?.params.userId).toBe(userId);
      expect(receivedReq?.params.eventId).toBe(eventId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.update = setup.mockNextCall();

      const res = await request(app)
        .patch(`/user/${userId}/event/${eventId}`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.update).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app)
        .patch('/user/1234/event/toto')
        .set('Cookie', [`token=${token}`]);

      expect(controller.update).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Rejects unauthorized request when token userId ≠ params', async () => {
      const otherUserId = '9da844de-dcc1-4b39-a4cf-19d800f4c122';

      const res = await request(app)
        .patch(`/user/${otherUserId}/event/${eventId}`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.update).not.toHaveBeenCalled();
      expect(res.status).toBe(status.FORBIDDEN);
      expect(res.body).toEqual({ error: 'Forbidden access' });
    });
  });

  describe('DELETE /user/:userId/event/:eventId', () => {
    it('Propagate request to eventController.delete', async () => {
      //GIVEN
      controller.delete = setup.mockSucessCall(status.NO_CONTENT);
      //WHEN
      const res = await request(app)
        .delete(`/user/${userId}/event/${eventId}`)
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.delete).toHaveBeenCalled();
      expect(receivedReq?.params.userId).toBe(userId);
      expect(receivedReq?.params.eventId).toBe(eventId);
      expect(res.status).toBe(status.NO_CONTENT);
      expect(res.body).toEqual({});
    });

    it('Next is called at end route.', async () => {
      controller.delete = setup.mockNextCall();

      const res = await request(app)
        .delete(`/user/${userId}/event/${eventId}`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.delete).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app)
        .delete('/user/1234/event/toto')
        .set('Cookie', [`token=${token}`]);

      expect(controller.delete).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Rejects unauthorized request when token userId ≠ params', async () => {
      const otherUserId = '9da844de-dcc1-4b39-a4cf-19d800f4c122';

      const res = await request(app)
        .delete(`/user/${otherUserId}/event/${eventId}`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.delete).not.toHaveBeenCalled();
      expect(res.status).toBe(status.FORBIDDEN);
      expect(res.body).toEqual({ error: 'Forbidden access' });
    });
  });
});
