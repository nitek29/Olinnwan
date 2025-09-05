import status from 'http-status';
import { NextFunction, Request, Response } from 'express';

import {
  Character,
  CharacterBodyData,
  CharacterEnriched,
} from '../../types/character.js';
import { CharacterRepository } from '../../middlewares/repository/characterRepository.js';
import { AuthenticatedRequest } from '../../middlewares/utils/authService.js';

export class CharacterController {
  private repository: CharacterRepository;

  public constructor(repository: CharacterRepository) {
    this.repository = repository;
  }

  // Méthode privée pour éviter la duplication de code
  private async updateCharacterLogic(
    characterId: string,
    characterData: Partial<CharacterBodyData>,
    checkOwnership: boolean = true,
  ): Promise<{
    success: boolean;
    character?: Character;
    error?: string;
    statusCode?: number;
  }> {
    try {
      // Vérifier que le personnage existe
      const existingCharacter =
        await this.repository.getOneEnriched(characterId);
      if (!existingCharacter) {
        return {
          success: false,
          error: 'Character not found',
          statusCode: status.NOT_FOUND,
        };
      }

      // Vérifier les droits d'accès
      if (
        checkOwnership &&
        existingCharacter.user?.id !== characterData.user_id
      ) {
        return {
          success: false,
          error: 'Forbidden access',
          statusCode: status.FORBIDDEN,
        };
      }

      // Mettre à jour le personnage
      const updatedCharacter = await this.repository.update(
        characterId,
        characterData,
      );
      if (!updatedCharacter) {
        return {
          success: false,
          error: 'Character not found',
          statusCode: status.NOT_FOUND,
        };
      }

      return { success: true, character: updatedCharacter };
    } catch (error) {
      throw error;
    }
  }

  // Méthode privée pour la suppression
  private async deleteCharacterLogic(
    characterId: string,
    checkOwnership: boolean = true,
    userId?: string,
  ): Promise<{ success: boolean; error?: string; statusCode?: number }> {
    try {
      // Vérifier que le personnage existe
      const existingCharacter =
        await this.repository.getOneEnriched(characterId);
      if (!existingCharacter) {
        return {
          success: false,
          error: 'Character not found',
          statusCode: status.NOT_FOUND,
        };
      }

      // Vérifier la propriété si nécessaire
      if (checkOwnership && userId && existingCharacter.user?.id !== userId) {
        return {
          success: false,
          error: 'Forbidden access',
          statusCode: status.FORBIDDEN,
        };
      }

      const result = await this.repository.delete(
        userId || existingCharacter.user?.id || '',
        characterId,
      );
      if (!result) {
        return {
          success: false,
          error: 'Event not found',
          statusCode: status.NOT_FOUND,
        };
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  public async getAllByUserId(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const userId: string = req.params.userId;

    try {
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }
      const characters: Character[] =
        await this.repository.getAllByUserId(userId);

      if (!characters.length) {
        res.status(status.NO_CONTENT).json({ error: 'Any character found' });
        return;
      }

      res.json(characters);
    } catch (error) {
      next(error);
    }
  }

  public async getAllEnrichedByUserId(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const userId: string = req.params.userId;

    try {
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }
      const characters: CharacterEnriched[] =
        await this.repository.getAllEnrichedByUserId(userId);

      if (!characters.length) {
        res.status(status.NO_CONTENT).json({ error: 'Any character found' });
        return;
      }
      res.json(characters);
    } catch (error) {
      next(error);
    }
  }

  public async getOneByUserId(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const { userId, characterId } = req.params;

    try {
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }

      const character: Character | null = await this.repository.getOneByUserId(
        userId,
        characterId,
      );

      if (!character) {
        res.status(status.NOT_FOUND).json({ error: 'Character not found' });
        return;
      }

      res.json(character);
    } catch (error) {
      next(error);
    }
  }

  public async getOneEnrichedByUserId(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const { userId, characterId } = req.params;

    try {
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }

      const character: CharacterEnriched | null =
        await this.repository.getOneEnrichedByUserId(userId, characterId);

      if (!character) {
        res.status(status.NOT_FOUND).json({ error: 'Character not found' });
        return;
      }

      res.json(character);
    } catch (error) {
      next(error);
    }
  }

  // public async post(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     if (!req.params.userId) {
  //       res.status(status.BAD_REQUEST).json({ error: "User ID is required" });
  //       return;
  //     }

  //     const userId: string = req.params.userId;
  //     const characterData: CharacterBodyData = { ...req.body, user_id: userId };

  //     const newCharacter = await this.repository.post(characterData);

  //     const newCharacterEnriched = await this.repository.getOneEnrichedByUserId(
  //       userId,
  //       newCharacter.id,
  //     );

  //     res.status(status.CREATED).json(newCharacterEnriched);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // public async updateOld(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     if (!req.params.userId) {
  //       res.status(status.BAD_REQUEST).json({ error: "User ID is required" });
  //       return;
  //     }

  //     const { userId, characterId } = req.params;
  //     const characterData: Partial<CharacterBodyData> = req.body;

  //     const characterUpdated: Character | null = await this.repository.update(
  //       userId,
  //       characterId,
  //       characterData,
  //     );

  //     if (!characterUpdated) {
  //       res.status(status.NOT_FOUND).json({ error: "Character not found" });
  //       return;
  //     }

  //     const characterUpdatedEnriched =
  //       await this.repository.getOneEnrichedByUserId(
  //         userId,
  //         characterUpdated.id,
  //       );

  //     res.json(characterUpdatedEnriched);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // public async deleteOld(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     if (!req.params.userId) {
  //       res.status(status.BAD_REQUEST).json({ error: "User ID is required" });
  //       return;
  //     }

  //     const { userId, characterId } = req.params;

  //     const result: boolean = await this.repository.delete(userId, characterId);

  //     if (!result) {
  //       res.status(status.NOT_FOUND).json({ error: "Character not found" });
  //       return;
  //     }

  //     res.status(status.NO_CONTENT).end();
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  // Nouvelles méthodes sécurisées avec JWT
  public async getUserCharacters(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }

      const characters: Character[] = await this.repository.getAllByUserId(
        req.userId,
      );

      if (!characters.length) {
        res.status(status.NO_CONTENT).json({ error: 'Any character found' });
        return;
      }

      res.json(characters);
    } catch (error) {
      next(error);
    }
  }

  public async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }

      const characterData: CharacterBodyData = {
        ...req.body,
        user_id: req.userId,
      };

      const newCharacter: Character = await this.repository.post(characterData);
      const newCharacterEnriched: CharacterEnriched | null =
        await this.repository.getOneEnrichedByUserId(
          req.userId,
          newCharacter.id,
        );

      res.status(status.CREATED).json(newCharacterEnriched);
    } catch (error) {
      next(error);
    }
  }

  public async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }

      if (!req.params.characterId) {
        res
          .status(status.BAD_REQUEST)
          .json({ error: 'Character ID is required' });
        return;
      }

      const { characterId } = req.params;
      const updateData: Partial<CharacterBodyData> = req.body;
      updateData.user_id = req.userId;

      // Utiliser la logique refactorisée avec vérification de propriété
      const result = await this.updateCharacterLogic(
        characterId,
        updateData,
        true,
      );

      if (!result.success) {
        res
          .status(result.statusCode || status.INTERNAL_SERVER_ERROR)
          .json({ error: result.error });
        return;
      }

      const updatedCharacterEnriched = await this.repository.getOneEnriched(
        result.character!.id,
      );

      res.json(updatedCharacterEnriched);
    } catch (error) {
      next(error);
    }
  }

  public async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }

      if (!req.params.characterId) {
        res
          .status(status.BAD_REQUEST)
          .json({ error: 'Character ID is required' });
        return;
      }

      const { characterId } = req.params;

      // Utiliser la logique refactorisée avec vérification de propriété
      const result = await this.deleteCharacterLogic(
        characterId,
        true,
        req.userId,
      );

      if (!result.success) {
        res
          .status(result.statusCode || status.INTERNAL_SERVER_ERROR)
          .json({ error: result.error });
        return;
      }

      res.status(status.NO_CONTENT).end();
    } catch (error) {
      next(error);
    }
  }

  // Méthodes pour les admins
  public async adminUpdateCharacter(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }

      if (!req.params.characterId) {
        res
          .status(status.BAD_REQUEST)
          .json({ error: 'Character ID is required' });
        return;
      }

      const { characterId } = req.params;
      const updateData: Partial<CharacterBodyData> = req.body;

      const updatedCharacter: Character | null = await this.repository.update(
        characterId,
        updateData,
      );

      if (!updatedCharacter) {
        res.status(status.NOT_FOUND).json({ error: 'Character not found' });
        return;
      }

      res.json(updatedCharacter);
    } catch (error) {
      next(error);
    }
  }

  public async adminDeleteCharacter(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        res.status(status.UNAUTHORIZED).json({ error: 'Unauthorized access' });
        return;
      }

      if (!req.params.characterId) {
        res
          .status(status.BAD_REQUEST)
          .json({ error: 'Character ID is required' });
        return;
      }

      const characterId = req.params.characterId;

      // Les admins peuvent supprimer n'importe quel personnage (checkOwnership = false)
      const result = await this.deleteCharacterLogic(
        characterId,
        false,
        req.userId,
      );

      if (!result.success) {
        res
          .status(result.statusCode || status.INTERNAL_SERVER_ERROR)
          .json({ error: result.error });
        return;
      }

      res.status(status.NO_CONTENT).end();
    } catch (error) {
      next(error);
    }
  }
}
