import request from 'supertest';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import express, { NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import status from 'http-status';
import jwt from 'jsonwebtoken';

import { Config } from '../../../config/config.js';
import { setup, receivedReq } from './mock-tools.js';
import { AuthService } from '../../../middlewares/utils/authService.js';
import { createCharacterRouter } from '../characterRouter.js';
import { CharacterController } from '../../controllers/characterController.js';
import { CharacterRepository } from '../../../middlewares/repository/characterRepository.js';

describe('characterRouter', () => {
  const repository = {} as CharacterRepository;
  const controller = new CharacterController(repository);
  const service = new AuthService();
  let app: ReturnType<typeof setup.App>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock AuthService methods only
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

    app = setup.App<CharacterController, [AuthService]>(
      controller,
      createCharacterRouter,
      {
        routerFactoryArgs: [service],
      },
    );
  });

  const config = Config.getInstance();
  const secret = config.jwtSecret;
  const userId = 'f0256483-0827-4cd5-923a-6bd10a135c4e';
  const characterId = '18d99a7c-1d47-4391-bacd-cc4848165768';
  const token = jwt.sign({ sub: userId }, secret, { expiresIn: '2h' });

  describe('GET /user/:userId/characters', () => {
    it('Propagate request to characterController.getAllByUserId', async () => {
      //GIVEN
      controller.getAllByUserId = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app)
        .get(`/user/${userId}/characters`)
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.getAllByUserId).toHaveBeenCalled();
      expect(receivedReq?.params.userId).toBe(userId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.getAllByUserId = setup.mockNextCall();

      const res = await request(app)
        .get(`/user/${userId}/characters`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.getAllByUserId).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app)
        .get('/user/1234/characters')
        .set('Cookie', [`token=${token}`]);

      expect(controller.getAllByUserId).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe('GET /user/:userId/character/:characterId', () => {
    it('Propagate request to characterController.getOneByUserId', async () => {
      //GIVEN
      controller.getOneByUserId = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app)
        .get(`/user/${userId}/character/${characterId}`)
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.getOneByUserId).toHaveBeenCalled();
      expect(receivedReq?.params.userId).toBe(userId);
      expect(receivedReq?.params.characterId).toBe(characterId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.getOneByUserId = setup.mockNextCall();

      const res = await request(app)
        .get(`/user/${userId}/character/${characterId}`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.getOneByUserId).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app)
        .get('/user/1234/character/toto')
        .set('Cookie', [`token=${token}`]);

      expect(controller.getOneByUserId).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe('GET /user/:userId/characters/enriched', () => {
    it('Propagate request to characterController.getAllByUserIdEnriched', async () => {
      //GIVEN
      controller.getAllEnrichedByUserId = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app)
        .get(`/user/${userId}/characters/enriched`)
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.getAllEnrichedByUserId).toHaveBeenCalled();
      expect(receivedReq?.params.userId).toBe(userId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.getAllEnrichedByUserId = setup.mockNextCall();

      const res = await request(app)
        .get(`/user/${userId}/characters/enriched`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.getAllEnrichedByUserId).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app)
        .get('/user/1234/characters/enriched')
        .set('Cookie', [`token=${token}`]);

      expect(controller.getAllEnrichedByUserId).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe('GET /user/:userId/character/:characterId/enriched', () => {
    it('Propagate request to characterController.getOneByUserIdEnriched', async () => {
      //GIVEN
      controller.getOneEnrichedByUserId = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app)
        .get(`/user/${userId}/character/${characterId}/enriched`)
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.getOneEnrichedByUserId).toHaveBeenCalled();
      expect(receivedReq?.params.userId).toBe(userId);
      expect(receivedReq?.params.characterId).toBe(characterId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.getOneEnrichedByUserId = setup.mockNextCall();

      const res = await request(app)
        .get(`/user/${userId}/character/${characterId}/enriched`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.getOneEnrichedByUserId).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app)
        .get('/user/1234/character/toto/enriched')
        .set('Cookie', [`token=${token}`]);

      expect(controller.getOneEnrichedByUserId).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });
  });

  describe('GET /characters', () => {
    it('Propagate request to characterController.getUserCharacters', async () => {
      //GIVEN
      controller.getUserCharacters = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app)
        .get('/characters')
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.getUserCharacters).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route.', async () => {
      controller.getUserCharacters = setup.mockNextCall();

      const res = await request(app)
        .get('/characters')
        .set('Cookie', [`token=${token}`]);

      expect(controller.getUserCharacters).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it('Should work without token and let controller handle authentication.', async () => {
      controller.getUserCharacters = setup.mockSucessCall(status.FORBIDDEN);

      const res = await request(app).get('/characters');

      expect(controller.getUserCharacters).toHaveBeenCalled();
      expect(res.status).toBe(status.FORBIDDEN);
    });
  });

  describe('POST /characters', () => {
    it('Propagate request to characterController.create with valid data', async () => {
      //GIVEN
      controller.create = setup.mockSucessCall(status.CREATED);
      //WHEN
      const res = await request(app)
        .post('/characters')
        .set('Cookie', [`token=${token}`])
        .send({
          name: 'TestChar',
          sex: 'M',
          level: 100,
          alignment: 'Bonta',
          breed_id: '550e8400-e29b-41d4-a716-446655440000',
          server_id: '6ba7b811-9dad-41d1-80b4-00c04fd430c8',
        });

      //THEN
      expect(controller.create).toHaveBeenCalled();
      expect(res.status).toBe(status.CREATED);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route with valid data', async () => {
      controller.create = setup.mockNextCall();

      const res = await request(app)
        .post('/characters')
        .set('Cookie', [`token=${token}`])
        .send({
          name: 'TestChar',
          sex: 'M',
          level: 100,
          alignment: 'Bonta',
          breed_id: '550e8400-e29b-41d4-a716-446655440000',
          server_id: '6ba7b811-9dad-41d1-80b4-00c04fd430c8',
        });

      expect(controller.create).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it('Should reject invalid data (missing required fields)', async () => {
      const res = await request(app)
        .post('/characters')
        .set('Cookie', [`token=${token}`])
        .send({
          name: 'TestChar',
          // Missing required fields: sex, level, breed_id, server_id
        });

      expect(controller.create).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Should reject invalid data (invalid alignment)', async () => {
      const res = await request(app)
        .post('/characters')
        .set('Cookie', [`token=${token}`])
        .send({
          name: 'TestChar',
          sex: 'M',
          level: 100,
          alignment: 'InvalidAlignment', // Invalid alignment
          breed_id: '550e8400-e29b-41d4-a716-446655440000',
          server_id: '6ba7b811-9dad-41d1-80b4-00c04fd430c8',
        });

      expect(controller.create).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Should reject invalid data (invalid UUID format)', async () => {
      const res = await request(app)
        .post('/characters')
        .set('Cookie', [`token=${token}`])
        .send({
          name: 'TestChar',
          sex: 'M',
          level: 100,
          alignment: 'Bonta',
          breed_id: 'invalid-uuid', // Invalid UUID
          server_id: '6ba7b811-9dad-41d1-80b4-00c04fd430c8',
        });

      expect(controller.create).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Should work without token and let controller handle authentication', async () => {
      controller.create = setup.mockSucessCall(status.FORBIDDEN);

      const res = await request(app).post('/characters').send({
        name: 'TestChar',
        sex: 'M',
        level: 100,
        alignment: 'Bonta',
        breed_id: '550e8400-e29b-41d4-a716-446655440000',
        server_id: '6ba7b811-9dad-41d1-80b4-00c04fd430c8',
      });

      expect(controller.create).toHaveBeenCalled();
      expect(res.status).toBe(status.FORBIDDEN);
    });
  });

  describe('PATCH /character/:characterId', () => {
    it('Propagate request to characterController.update with valid data', async () => {
      //GIVEN
      controller.update = setup.mockSucessCall(status.OK);
      //WHEN
      const res = await request(app)
        .patch(`/character/${characterId}`)
        .set('Cookie', [`token=${token}`])
        .send({
          level: 200,
          alignment: 'Brâkmar',
        });
      //THEN
      expect(controller.update).toHaveBeenCalled();
      expect(receivedReq?.params.characterId).toBe(characterId);
      expect(res.status).toBe(status.OK);
      expect(res.body).toBe('Success!');
    });

    it('Next is called at end route with valid data', async () => {
      controller.update = setup.mockNextCall();

      const res = await request(app)
        .patch(`/character/${characterId}`)
        .set('Cookie', [`token=${token}`])
        .send({
          level: 150,
        });

      expect(controller.update).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it('Should reject invalid UUID in params', async () => {
      const res = await request(app)
        .patch('/character/toto')
        .set('Cookie', [`token=${token}`])
        .send({
          level: 200,
        });

      expect(controller.update).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Should reject invalid data (invalid alignment)', async () => {
      const res = await request(app)
        .patch(`/character/${characterId}`)
        .set('Cookie', [`token=${token}`])
        .send({
          level: 200,
          alignment: 'InvalidAlignment', // Invalid alignment
        });

      expect(controller.update).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Should reject invalid data (level out of range)', async () => {
      const res = await request(app)
        .patch(`/character/${characterId}`)
        .set('Cookie', [`token=${token}`])
        .send({
          level: 250, // Level too high (max is 200)
        });

      expect(controller.update).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Should work without token and let controller handle authentication', async () => {
      controller.update = setup.mockSucessCall(status.FORBIDDEN);

      const res = await request(app).patch(`/character/${characterId}`).send({
        level: 200,
      });

      expect(controller.update).toHaveBeenCalled();
      expect(res.status).toBe(status.FORBIDDEN);
    });
  });

  describe('DELETE /character/:characterId', () => {
    it('Propagate request to characterController.delete', async () => {
      //GIVEN
      controller.delete = setup.mockSucessCall(status.NO_CONTENT);
      //WHEN
      const res = await request(app)
        .delete(`/character/${characterId}`)
        .set('Cookie', [`token=${token}`]);
      //THEN
      expect(controller.delete).toHaveBeenCalled();
      expect(receivedReq?.params.characterId).toBe(characterId);
      expect(res.status).toBe(status.NO_CONTENT);
      expect(res.body).toEqual({});
    });

    it('Next is called at end route.', async () => {
      controller.delete = setup.mockNextCall();

      const res = await request(app)
        .delete(`/character/${characterId}`)
        .set('Cookie', [`token=${token}`]);

      expect(controller.delete).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
      expect(res.body).toEqual({ called: 'next' });
    });

    it("Excluded bad request when id isn't a UUID.", async () => {
      const res = await request(app)
        .delete('/character/toto')
        .set('Cookie', [`token=${token}`]);

      expect(controller.delete).not.toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it('Should work without token and let controller handle authentication.', async () => {
      controller.delete = setup.mockSucessCall(status.FORBIDDEN);

      const res = await request(app).delete(`/character/${characterId}`);

      expect(controller.delete).toHaveBeenCalled();
      expect(res.status).toBe(status.FORBIDDEN);
    });
  });
});
