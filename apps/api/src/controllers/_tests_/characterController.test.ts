import { describe, it, expect, vi, beforeEach } from 'vitest';

import status from 'http-status';
import type { Request, Response } from 'express';

import {
  Character,
  CharacterBodyData,
  CharacterEnriched,
} from '../../../types/character.js';
import { CharacterController } from '../characterController.js';
import { CharacterRepository } from '../../../middlewares/repository/characterRepository.js';
import { AuthenticatedRequest } from '../../../middlewares/utils/authService.js';

describe('CharacterController', () => {
  let req: Partial<Request | AuthenticatedRequest>;
  let res: Partial<Response>;
  const next = vi.fn();

  vi.mock('../../../middlewares/repository/characterRepository.js');
  const mockGetAll = vi.spyOn(CharacterRepository.prototype, 'getAllByUserId');
  const mockGetOne = vi.spyOn(CharacterRepository.prototype, 'getOneByUserId');
  const mockGetAllEnriched = vi.spyOn(
    CharacterRepository.prototype,
    'getAllEnrichedByUserId',
  );
  const mockGetOneEnriched = vi.spyOn(
    CharacterRepository.prototype,
    'getOneEnrichedByUserId',
  );
  const mockGetOneEnrichedGeneral = vi.spyOn(
    CharacterRepository.prototype,
    'getOneEnriched',
  );
  const mockPost = vi.spyOn(CharacterRepository.prototype, 'post');
  const mockUpdate = vi.spyOn(CharacterRepository.prototype, 'update');
  const mockDelete = vi.spyOn(CharacterRepository.prototype, 'delete');

  req = {};
  res = {
    json: vi.fn(),
    status: vi.fn().mockReturnThis(),
    end: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const underTest: CharacterController = new CharacterController(
    new CharacterRepository(),
  );

  // --- GET ALL ---
  describe('getAllByUserId', () => {
    req.params = { userId: '436d798e-b084-454c-8f78-593e966a9a66' };

    it('Return characters if exist.', async () => {
      // GIVEN
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = { userId: '436d798e-b084-454c-8f78-593e966a9a67' };

      const mockCharacters: Character[] = [
        {
          id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
          name: 'Night-Hunter',
          sex: 'M',
          level: 190,
          alignment: 'Bonta',
          stuff: 'https://d-bk.net/fr/d/1EFhw',
          default_character: true,
        },
      ];

      mockGetAll.mockResolvedValue(mockCharacters);
      // WHEN
      await underTest.getAllByUserId(authReq, res as Response, next);
      //THEN
      expect(mockGetAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCharacters);
      expect(res.status).not.toHaveBeenCalledWith(status.NOT_FOUND);
    });

    it('Return 403 if user is not authenticated.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = undefined;

      await underTest.getAllByUserId(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden access' });
    });

    it('Return 404 if any character found.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = { userId: '436d798e-b084-454c-8f78-593e966a9a67' };

      const mockCharacters: Character[] = [];

      mockGetAll.mockResolvedValue(mockCharacters);
      await underTest.getAllByUserId(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.NO_CONTENT);
      expect(res.json).toHaveBeenCalledWith({ error: 'Any character found' });
    });

    it('Call next() in case of error.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = { userId: '436d798e-b084-454c-8f78-593e966a9a67' };

      const error = new Error();

      mockGetAll.mockRejectedValue(error);
      await underTest.getAllByUserId(authReq, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- GET ONE ---
  describe('getOneByUserId', () => {
    req.params = {
      userId: '436d798e-b084-454c-8f78-593e966a9a66',
      characterId: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
    };

    it('Return character if exists', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = {
        userId: '436d798e-b084-454c-8f78-593e966a9a67',
        characterId: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
      };

      const mockCharacter: Character = {
        id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
        name: 'Night-Hunter',
        sex: 'M',
        level: 190,
        alignment: 'Bonta',
        stuff: 'https://d-bk.net/fr/d/1EFhw',
        default_character: true,
      };

      mockGetOne.mockResolvedValue(mockCharacter);
      await underTest.getOneByUserId(authReq, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockCharacter);
    });

    it('Return 403 if user is not authenticated.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = undefined;

      await underTest.getOneByUserId(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden access' });
    });

    it("Call next() if character doesn't exists.", async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = {
        userId: '436d798e-b084-454c-8f78-593e966a9a67',
        characterId: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
      };

      mockGetOne.mockResolvedValue(null);
      await underTest.getOneByUserId(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ error: 'Character not found' });
    });

    it('Call next() in case of error.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = {
        userId: '436d798e-b084-454c-8f78-593e966a9a67',
        characterId: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
      };

      const error = new Error();

      mockGetOne.mockRejectedValue(error);
      await underTest.getOneByUserId(authReq, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- GET ALL ENRICHED ---
  describe('getAllByUserIdEnriched', () => {
    req.params = { userId: '436d798e-b084-454c-8f78-593e966a9a66' };

    it('Return characters if exist.', async () => {
      // GIVEN
      const mockCharactersEnriched: CharacterEnriched[] = [
        {
          id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
          name: 'Night-Hunter',
          sex: 'M',
          level: 190,
          alignment: 'Bonta',
          stuff: 'https://d-bk.net/fr/d/1EFhw',
          default_character: true,
          user: {
            id: '436d798e-b084-454c-8f78-593e966a9a66',
            username: 'Goldorak',
            role: 'user',
          },
          breed: { id: '9a252130-3af3-4e5c-a957-a04a6f23c59a', name: 'Sram' },
          server: {
            id: 'c3e35f15-d01a-439e-98ed-4a15ff39dae2',
            name: 'Dakal',
            mono_account: true,
          },
          events: [],
        },
      ];

      mockGetAllEnriched.mockResolvedValue(mockCharactersEnriched);
      // WHEN
      await underTest.getAllEnrichedByUserId(
        req as AuthenticatedRequest,
        res as Response,
        next,
      );
      //THEN
      expect(mockGetAllEnriched).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCharactersEnriched);
      expect(res.status).not.toHaveBeenCalledWith(status.NOT_FOUND);
    });

    it('Return 403 if user is not authenticated.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = undefined;

      await underTest.getAllEnrichedByUserId(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden access' });
    });

    it('Return 404 if any character found.', async () => {
      const mockCharactersEnriched: CharacterEnriched[] = [];
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a68';

      mockGetAllEnriched.mockResolvedValue(mockCharactersEnriched);
      await underTest.getAllEnrichedByUserId(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.NO_CONTENT);
      expect(res.json).toHaveBeenCalledWith({ error: 'Any character found' });
    });

    it('Call next() in case of error.', async () => {
      const error = new Error();

      mockGetAllEnriched.mockRejectedValue(error);
      await underTest.getAllEnrichedByUserId(
        req as AuthenticatedRequest,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- GET ONE ENRICHED ---
  describe('getOneByUserIdEnriched', () => {
    req.params = {
      userId: '436d798e-b084-454c-8f78-593e966a9a66',
      characterId: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
    };

    it('Return character if exists', async () => {
      const mockCharacterEnriched: CharacterEnriched = {
        id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
        name: 'Night-Hunter',
        sex: 'M',
        level: 190,
        alignment: 'Bonta',
        stuff: 'https://d-bk.net/fr/d/1EFhw',
        default_character: true,
        user: {
          id: '436d798e-b084-454c-8f78-593e966a9a66',
          username: 'Goldorak',
          role: 'user',
        },
        breed: { id: '9a252130-3af3-4e5c-a957-a04a6f23c59a', name: 'Sram' },
        server: {
          id: 'c3e35f15-d01a-439e-98ed-4a15ff39dae2',
          name: 'Dakal',
          mono_account: true,
        },
        events: [],
      };

      mockGetOneEnriched.mockResolvedValue(mockCharacterEnriched);
      await underTest.getOneEnrichedByUserId(
        req as AuthenticatedRequest,
        res as Response,
        next,
      );

      expect(res.json).toHaveBeenCalledWith(mockCharacterEnriched);
    });

    it('Return 403 if user is not authenticated.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = undefined;

      await underTest.getOneEnrichedByUserId(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden access' });
    });

    it("Call next() if character doesn't exists.", async () => {
      mockGetOneEnriched.mockResolvedValue(null);

      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';

      await underTest.getOneEnrichedByUserId(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ error: 'Character not found' });
    });

    it('Call next() in case of error.', async () => {
      const error = new Error();

      mockGetOneEnriched.mockRejectedValue(error);

      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';

      await underTest.getOneEnrichedByUserId(authReq, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- CREATE CHARACTER (Authenticated) ---
  describe('createCharacter', () => {
    it('Return character if created with authenticated user.', async () => {
      // GIVEN
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.body = {
        name: 'TestChar',
        sex: 'M',
        level: 100,
        alignment: 'Bonta',
        stuff: 'https://d-bk.net/fr/d/test',
        default_character: false,
        breed_id: '123e4567-e89b-12d3-a456-426614174000',
        server_id: '987fcdeb-51a2-43d1-9c45-987654321000',
      };
      const expectedCharacterData = {
        ...authReq.body,
        user_id: authReq.userId,
      };
      const mockNewCharacter: Character = {
        id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
        name: 'TestChar',
        sex: 'M',
        level: 100,
        alignment: 'Bonta',
        stuff: 'https://d-bk.net/fr/d/test',
        default_character: false,
      };

      const mockNewCharacterEnriched: CharacterEnriched = {
        id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
        name: 'TestChar',
        sex: 'M',
        level: 100,
        alignment: 'Bonta',
        stuff: 'https://d-bk.net/fr/d/test',
        default_character: false,
        user: {
          id: '436d798e-b084-454c-8f78-593e966a9a66',
          username: 'TestUser',
          role: 'user',
        },
        breed: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'TestBreed',
        },
        server: {
          id: '987fcdeb-51a2-43d1-9c45-987654321000',
          name: 'TestServer',
          mono_account: false,
        },
        events: [],
      };

      mockPost.mockResolvedValue(mockNewCharacter);
      mockGetOneEnriched.mockResolvedValue(mockNewCharacterEnriched);
      // WHEN
      await underTest.create(authReq, res as Response, next);
      //THEN
      expect(mockPost).toHaveBeenCalledWith(expectedCharacterData);
      expect(res.status).toHaveBeenCalledWith(status.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockNewCharacterEnriched);
    });

    it('Return 403 if user is not authenticated.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = undefined;

      await underTest.create(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden access' });
    });

    it('Call next() in case of error.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.body = {
        name: 'TestChar',
        sex: 'M',
        level: 100,
      };
      const error = new Error();

      mockPost.mockRejectedValue(error);
      await underTest.create(authReq, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- UPDATE (Authenticated) ---
  describe('update (Authenticated)', () => {
    it('Return character if updated with authenticated user.', async () => {
      // GIVEN
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = { characterId: '0f309e32-2281-4b46-bb2e-bc2a7248e39b' };
      authReq.body = {
        level: 200,
        alignment: 'Brakmar',
        default_character: false,
      };

      const mockExistingCharacterEnriched: CharacterEnriched = {
        id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
        name: 'Night-Hunter',
        sex: 'M',
        level: 190,
        alignment: 'Bonta',
        stuff: 'https://d-bk.net/fr/d/1EFhw',
        default_character: true,
        user: {
          id: '436d798e-b084-454c-8f78-593e966a9a66',
          username: 'TestUser',
          role: 'user',
        },
        breed: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'TestBreed',
        },
        server: {
          id: '987fcdeb-51a2-43d1-9c45-987654321000',
          name: 'TestServer',
          mono_account: false,
        },
        events: [],
      };

      const mockUpdatedCharacter: Character = {
        id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
        name: 'Night-Hunter',
        sex: 'M',
        level: 200,
        alignment: 'Brakmar',
        stuff: 'https://d-bk.net/fr/d/1EFhw',
        default_character: false,
      };

      const mockUpdatedCharacterEnriched: CharacterEnriched = {
        id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
        name: 'Night-Hunter',
        sex: 'M',
        level: 200,
        alignment: 'Brakmar',
        stuff: 'https://d-bk.net/fr/d/1EFhw',
        default_character: false,
        user: {
          id: '436d798e-b084-454c-8f78-593e966a9a66',
          username: 'TestUser',
          role: 'user',
        },
        breed: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'TestBreed',
        },
        server: {
          id: '987fcdeb-51a2-43d1-9c45-987654321000',
          name: 'TestServer',
          mono_account: false,
        },
        events: [],
      };

      // Mock des appels dans updateCharacterLogic
      mockGetOneEnrichedGeneral.mockResolvedValue(
        mockExistingCharacterEnriched,
      );
      mockUpdate.mockResolvedValue(mockUpdatedCharacter);
      mockGetOneEnrichedGeneral
        .mockResolvedValueOnce(mockExistingCharacterEnriched)
        .mockResolvedValueOnce(mockUpdatedCharacterEnriched);

      // WHEN
      await underTest.update(authReq, res as Response, next);
      //THEN
      const expectedUpdateData = {
        ...authReq.body,
        user_id: authReq.userId,
      };
      expect(mockUpdate).toHaveBeenCalledWith(
        authReq.params.characterId,
        expectedUpdateData,
      );
      expect(res.json).toHaveBeenCalledWith(mockUpdatedCharacterEnriched);
    });

    it('Return 403 if user is not authenticated.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = undefined;

      await underTest.update(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden access' });
    });

    it('Return 404 if character not found.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = { characterId: 'non-existent-id' };
      authReq.body = {
        level: 200,
      };

      mockUpdate.mockResolvedValue(null);
      await underTest.update(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ error: 'Character not found' });
    });

    it('Call next() in case of error.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = { characterId: '0f309e32-2281-4b46-bb2e-bc2a7248e39b' };
      authReq.body = {
        level: 200,
      };
      const error = new Error();

      mockUpdate.mockRejectedValue(error);
      await underTest.update(authReq, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- DELETE (Authenticated) ---
  describe('delete (Authenticated)', () => {
    it('Return 204 if character is deleted with authenticated user.', async () => {
      // GIVEN
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = { characterId: '0f309e32-2281-4b46-bb2e-bc2a7248e39b' };

      const mockExistingCharacterEnriched: CharacterEnriched = {
        id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
        name: 'Night-Hunter',
        sex: 'M',
        level: 190,
        alignment: 'Bonta',
        stuff: 'https://d-bk.net/fr/d/1EFhw',
        default_character: true,
        user: {
          id: '436d798e-b084-454c-8f78-593e966a9a66',
          username: 'TestUser',
          role: 'user',
        },
        breed: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'TestBreed',
        },
        server: {
          id: '987fcdeb-51a2-43d1-9c45-987654321000',
          name: 'TestServer',
          mono_account: false,
        },
        events: [],
      };

      // Mock uniquement getOneEnriched pour retourner le caractère existant
      mockGetOneEnrichedGeneral.mockResolvedValue(
        mockExistingCharacterEnriched,
      );
      mockDelete.mockResolvedValue(true);

      // WHEN
      await underTest.delete(authReq, res as Response, next);

      //THEN
      expect(mockGetOneEnrichedGeneral).toHaveBeenCalledWith(
        authReq.params.characterId,
      );
      expect(mockDelete).toHaveBeenCalledWith(
        authReq.userId,
        authReq.params.characterId,
      );
      expect(res.status).toHaveBeenCalledWith(status.NO_CONTENT);
      expect(res.end).toHaveBeenCalled();
    });

    it('Return 403 if user is not authenticated.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = undefined;

      await underTest.delete(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden access' });
    });

    it('Return 404 if character not found.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = { characterId: 'non-existent-id' };

      // Mock pour simuler caractère non trouvé ou utilisateur non propriétaire
      mockGetOneEnrichedGeneral.mockResolvedValue(null);

      await underTest.delete(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ error: 'Character not found' });
    });

    it('Call next() in case of error.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';
      authReq.params = { characterId: '0f309e32-2281-4b46-bb2e-bc2a7248e39b' };
      const error = new Error();

      mockGetOneEnrichedGeneral.mockRejectedValue(error);
      await underTest.delete(authReq, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // --- GET USER CHARACTERS (Authenticated) ---
  describe('getUserCharacters', () => {
    it('Return characters if exist.', async () => {
      // GIVEN
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';

      const mockCharacters: Character[] = [
        {
          id: '0f309e32-2281-4b46-bb2e-bc2a7248e39b',
          name: 'Night-Hunter',
          sex: 'M',
          level: 190,
          alignment: 'Bonta',
          stuff: 'https://d-bk.net/fr/d/1EFhw',
          default_character: true,
        },
      ];

      mockGetAll.mockResolvedValue(mockCharacters);
      // WHEN
      await underTest.getUserCharacters(authReq, res as Response, next);
      //THEN
      expect(mockGetAll).toHaveBeenCalledWith(authReq.userId);
      expect(res.json).toHaveBeenCalledWith(mockCharacters);
      expect(res.status).not.toHaveBeenCalledWith(status.NOT_FOUND);
    });

    it('Return 403 if user is not authenticated.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = undefined;

      await underTest.getUserCharacters(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden access' });
    });

    it('Return 204 if no characters found.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';

      const mockCharacters: Character[] = [];

      mockGetAll.mockResolvedValue(mockCharacters);
      await underTest.getUserCharacters(authReq, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status.NO_CONTENT);
      expect(res.json).toHaveBeenCalledWith({ error: 'Any character found' });
    });

    it('Call next() in case of error.', async () => {
      const authReq = req as AuthenticatedRequest;
      authReq.userId = '436d798e-b084-454c-8f78-593e966a9a66';

      const error = new Error();

      mockGetAll.mockRejectedValue(error);
      await underTest.getUserCharacters(authReq, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
