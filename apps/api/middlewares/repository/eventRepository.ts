import { Op } from 'sequelize';

import CharacterEntity from '../../database/models/Character.js';
import EventEntity from '../../database/models/Event.js';
import { Event, EventEnriched, EventBodyData } from '../../types/event.js';
import { EventUtils } from './utils/eventUtils.js';

export class EventRepository {
  private utils: EventUtils;

  public constructor(utils: EventUtils) {
    this.utils = utils;
  }
  public async getAll(): Promise<Event[]> {
    try {
      const result: EventEntity[] = await EventEntity.findAll({
        include: ['tag', 'server', 'characters'],
      });

      const events: Event[] = result.map((event: EventEntity) =>
        event.get({ plain: true }),
      );

      return events;
    } catch (error) {
      throw error;
    }
  }

  public async getAllEnriched(): Promise<EventEnriched[]> {
    try {
      const result: EventEntity[] = await EventEntity.findAll({
        include: [
          'tag',
          'server',
          'comments',
          'characters',
          'user',
          {
            association: 'user',
            attributes: { exclude: ['mail', 'password'] },
          },
        ],
      });

      const events: EventEnriched[] = result.map((event: EventEntity) =>
        event.get({ plain: true }),
      );

      return events;
    } catch (error) {
      throw error;
    }
  }

  public async getOne(eventId: string): Promise<Event | null> {
    try {
      const result: EventEntity | null = await EventEntity.findByPk(eventId);

      if (!result) {
        return null;
      }

      const event: Event = result.get({ plain: true });

      return event;
    } catch (error) {
      throw error;
    }
  }

  public async getOneEnriched(eventId: string): Promise<EventEnriched | null> {
    try {
      const result: EventEntity | null = await EventEntity.findByPk(eventId, {
        include: [
          'tag',
          'server',
          'comments',
          'characters',
          {
            association: 'user',
            attributes: { exclude: ['mail', 'password'] },
          },
        ],
      });

      if (!result) {
        return null;
      }

      const event: EventEnriched = result.get({ plain: true });

      return event;
    } catch (error) {
      throw error;
    }
  }

  public async post(eventData: EventBodyData): Promise<Event> {
    try {
      const { characters_id, ...eventFields } = eventData;

      // Stage1 - create event
      const event = await EventEntity.create(eventFields);

      // Stage 2 - Vérifier et ajouter les personnages s'ils existent
      if (characters_id && characters_id.length > 0) {
        // Récupérer les personnages
        const characters: CharacterEntity[] = await CharacterEntity.findAll({
          where: {
            id: {
              [Op.in]: characters_id,
            },
          },
        });

        if (!characters.length) {
          throw new Error('Characters not found');
        }

        // Vérifier que les personnages sont du même serveur que l'événement
        const validCharactersId = this.utils.checkCharactersServer(
          event,
          characters,
        );

        // Ajouter les personnages validés
        await event.addCharacters(validCharactersId);
      }

      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  public async addCharactersToEvent(
    eventId: string,
    charactersId: string[],
  ): Promise<Event | null> {
    try {
      const result: EventEntity | null = await EventEntity.findByPk(eventId);

      if (!result) {
        return null;
      }

      this.utils.checkTeamMaxLength(result, charactersId);

      let characters: CharacterEntity[] = await CharacterEntity.findAll({
        where: {
          id: {
            [Op.in]: charactersId,
          },
        },
      });

      if (!characters.length) {
        throw new Error('Characters not found');
      }

      characters = this.utils.exceptCharactersAlreadyInTeam(result, characters);

      const validCharactersId = this.utils.checkCharactersServer(
        result,
        characters,
      );

      await result.addCharacters(validCharactersId);

      return result;
    } catch (error) {
      throw error;
    }
  }

  public async removeCharactersFromEvent(
    eventId: string,
    charactersId: string[],
  ): Promise<Event | null> {
    try {
      const result: EventEntity | null = await EventEntity.findOne({
        where: { id: eventId },
        include: ['characters'],
      });

      if (!result) {
        return null;
      }

      const characters: CharacterEntity[] = await CharacterEntity.findAll({
        where: {
          id: {
            [Op.in]: charactersId,
          },
        },
      });

      if (!characters.length) {
        throw new Error('Characters not found');
      }

      const validCharactersId = this.utils.exceptCharactersNotInTeam(
        result,
        characters,
      );

      this.utils.checkTeamMinLength(result, validCharactersId);

      if (!validCharactersId.length) {
        throw new Error('Unavailable characters to remove');
      }

      await result.removeCharacters(validCharactersId);

      return result;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    eventId: string,
    eventData: Partial<EventBodyData>,
  ): Promise<EventEnriched | null> {
    try {
      const eventToUpdate: EventEntity | null = await EventEntity.findOne({
        where: { id: eventId, user_id: eventData.user_id },
        include: ['tag', 'user', 'server', 'characters'],
      });

      if (!eventToUpdate) {
        return null;
      }

      const result: EventEntity = await eventToUpdate.update(eventData);

      const eventUpdated = result.get({ plain: true });

      return eventUpdated;
    } catch (error) {
      throw error;
    }
  }

  public async delete(userId: string, eventId: string): Promise<boolean> {
    try {
      const result: EventEntity | null = await EventEntity.findOne({
        where: { id: eventId, user_id: userId },
      });

      if (!result) {
        return false;
      }

      result.destroy();

      return true;
    } catch (error) {
      throw error;
    }
  }
}
