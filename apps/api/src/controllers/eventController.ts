import status from 'http-status';
import { NextFunction, Request, Response } from 'express';

import { Event, EventBodyData, EventEnriched } from '../../types/event.js';
import { EventRepository } from '../../middlewares/repository/eventRepository.js';
import { AuthenticatedRequest } from '../../middlewares/utils/authService.js';

export class EventController {
  private repository: EventRepository;

  public constructor(repository: EventRepository) {
    this.repository = repository;
  }

  // Méthode privée pour éviter la duplication de code
  private async updateEventLogic(
    eventId: string,
    eventData: Partial<EventBodyData>,
    checkOwnership: boolean = true,
  ): Promise<{
    success: boolean;
    event?: Event;
    error?: string;
    statusCode?: number;
  }> {
    try {
      // Vérifier que l'événement existe
      const existingEvent = await this.repository.getOneEnriched(eventId);
      if (!existingEvent) {
        return {
          success: false,
          error: 'Event not found',
          statusCode: status.NOT_FOUND,
        };
      }

      // Vérifier la propriété si nécessaire
      if (
        checkOwnership &&
        eventData.user_id &&
        existingEvent.user?.id !== eventData.user_id
      ) {
        return {
          success: false,
          error: 'Forbidden access',
          statusCode: status.FORBIDDEN,
        };
      }

      const eventUpdated = await this.repository.update(eventId, eventData);
      if (!eventUpdated) {
        return {
          success: false,
          error: 'Event not found',
          statusCode: status.NOT_FOUND,
        };
      }

      return { success: true, event: eventUpdated };
    } catch (error) {
      throw error;
    }
  }

  // Méthode privée pour la suppression
  private async deleteEventLogic(
    eventId: string,
    checkOwnership: boolean = true,
    userId?: string,
  ): Promise<{ success: boolean; error?: string; statusCode?: number }> {
    try {
      // Vérifier que l'événement existe
      const existingEvent = await this.repository.getOneEnriched(eventId);
      if (!existingEvent) {
        return {
          success: false,
          error: 'Event not found',
          statusCode: status.NOT_FOUND,
        };
      }

      // Vérifier la propriété si nécessaire
      if (checkOwnership && userId && existingEvent.user?.id !== userId) {
        return {
          success: false,
          error: 'Forbidden access',
          statusCode: status.FORBIDDEN,
        };
      }

      const result = await this.repository.delete(
        userId || existingEvent.user?.id || '',
        eventId,
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

  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const limitParam = parseInt(req.query.limit as string, 10);
      const pageParam = parseInt(req.query.page as string, 10);

      const limit = !isNaN(limitParam) && limitParam > 0 ? limitParam : 10;
      const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;

      let events: Event[] = await this.repository.getAll();

      if (!events.length) {
        res.status(status.NO_CONTENT).json({ error: 'Any event found' });
        return;
      }

      // Filter passed events
      const now = new Date();
      events = events.filter((event) => new Date(event.date) >= now);

      // Filter by ascending date
      events.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      const total = events.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;

      const pagedEvents = events.slice(start, end);

      res.json({
        events: pagedEvents,
        page,
        limit,
        total,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getAllEnriched(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const events: EventEnriched[] = await this.repository.getAllEnriched();

      if (!events.length) {
        res.status(status.NO_CONTENT).json({ error: 'Any event found' });
        return;
      }

      res.json(events);
    } catch (error) {
      next(error);
    }
  }

  public async getOne(req: Request, res: Response, next: NextFunction) {
    const eventId: string = req.params.eventId;

    try {
      const event: Event | null = await this.repository.getOne(eventId);

      if (!event) {
        res.status(status.NOT_FOUND).json({ error: 'Event not found' });
        return;
      }

      res.json(event);
    } catch (error) {
      next(error);
    }
  }

  public async getOneEnriched(req: Request, res: Response, next: NextFunction) {
    const eventId: string = req.params.eventId;

    try {
      const event: EventEnriched | null =
        await this.repository.getOneEnriched(eventId);

      if (!event) {
        res.status(status.NOT_FOUND).json({ error: 'Event not found' });
        return;
      }

      res.json(event);
    } catch (error) {
      next(error);
    }
  }

  public async post(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.userId) {
        res.status(status.BAD_REQUEST).json({ error: 'User ID is required' });
        return;
      }

      const userId: string = req.params.userId;
      const eventData: EventBodyData = { ...req.body, user_id: userId };

      const newEvent: EventEnriched = await this.repository.post(eventData);

      const newEventEnriched = await this.repository.getOneEnriched(
        newEvent.id,
      );

      res.status(status.CREATED).json(newEventEnriched);
    } catch (error) {
      next(error);
    }
  }

  public async addCharactersToEvent(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.params.eventId) {
        res.status(status.BAD_REQUEST).json({ error: 'Event ID is required' });
        return;
      }

      const eventId: string = req.params.eventId;
      const charactersIds: string[] = req.body.characters_id;

      const eventUpdated: Event | null =
        await this.repository.addCharactersToEvent(eventId, charactersIds);

      if (!eventUpdated) {
        res.status(status.NOT_FOUND).json({ error: 'Event not found' });
        return;
      }

      const eventUpdatedEnriched: EventEnriched | null =
        await this.repository.getOneEnriched(eventUpdated.id);

      if (!eventUpdatedEnriched) {
        res
          .status(status.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to retrieve enriched event' });
        return;
      }

      res.json(eventUpdatedEnriched);
    } catch (error) {
      next(error);
    }
  }

  public async removeCharactersFromEvent(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.params.eventId) {
        res.status(status.BAD_REQUEST).json({ error: 'Event ID is required' });
        return;
      }

      const eventId: string = req.params.eventId;
      const charactersId: string[] = req.body.characters_id;

      const eventUpdated: Event | null =
        await this.repository.removeCharactersFromEvent(eventId, charactersId);

      if (!eventUpdated) {
        res.status(status.NOT_FOUND).json({ error: 'Event not found' });
        return;
      }

      const eventUpdatedEnriched: EventEnriched | null =
        await this.repository.getOneEnriched(eventUpdated.id);

      if (!eventUpdatedEnriched) {
        res
          .status(status.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to retrieve enriched event' });
        return;
      }

      res.json(eventUpdatedEnriched);
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

      if (!req.params.eventId) {
        res.status(status.BAD_REQUEST).json({ error: 'Event ID is required' });
        return;
      }

      const eventId = req.params.eventId;
      const eventData: Partial<EventBodyData> = req.body;
      eventData.user_id = req.userId;

      // Utiliser la logique refactorisée avec vérification de propriété
      const result = await this.updateEventLogic(eventId, eventData, true);

      if (!result.success) {
        res
          .status(result.statusCode || status.INTERNAL_SERVER_ERROR)
          .json({ error: result.error });
        return;
      }

      const eventUpdatedEnriched = await this.repository.getOneEnriched(
        result.event!.id,
      );
      res.json(eventUpdatedEnriched);
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

      if (!req.params.eventId) {
        res.status(status.BAD_REQUEST).json({ error: 'Event ID is required' });
        return;
      }

      const eventId = req.params.eventId;

      // Utiliser la logique refactorisée avec vérification de propriété
      const result = await this.deleteEventLogic(eventId, true, req.userId);

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

  public async createEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Vérifier que l'utilisateur est authentifié
      if (!req.userId) {
        res.status(status.FORBIDDEN).json({ error: 'Forbidden access' });
        return;
      }

      // L'userId vient du JWT via le middleware d'authentification
      const userId = req.userId;
      const eventData: EventBodyData = {
        ...req.body,
        user_id: userId, // Assigné automatiquement depuis le JWT
      };

      const newEvent: EventEnriched = await this.repository.post(eventData);
      const newEventEnriched: EventEnriched | null =
        await this.repository.getOneEnriched(newEvent.id);
      res.status(status.CREATED).json(newEventEnriched);
    } catch (error) {
      next(error);
    }
  }

  // Méthodes pour les admins
  public async adminUpdateEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        res.status(status.UNAUTHORIZED).json({ error: 'Unauthorized access' });
        return;
      }

      if (!req.params.eventId) {
        res.status(status.BAD_REQUEST).json({ error: 'Event ID is required' });
        return;
      }

      const eventId = req.params.eventId;
      const eventData: Partial<EventBodyData> = req.body;
      eventData.user_id = req.userId;

      // Les admins peuvent modifier n'importe quel événement (checkOwnership = false)
      const result = await this.updateEventLogic(eventId, eventData, false);

      if (!result.success) {
        res
          .status(result.statusCode || status.INTERNAL_SERVER_ERROR)
          .json({ error: result.error });
        return;
      }

      const eventUpdatedEnriched = await this.repository.getOneEnriched(
        result.event!.id,
      );
      res.json(eventUpdatedEnriched);
    } catch (error) {
      next(error);
    }
  }

  public async adminDeleteEvent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        res.status(status.UNAUTHORIZED).json({ error: 'Unauthorized access' });
        return;
      }

      if (!req.params.eventId) {
        res.status(status.BAD_REQUEST).json({ error: 'Event ID is required' });
        return;
      }

      const eventId = req.params.eventId;

      // Les admins peuvent supprimer n'importe quel événement (checkOwnership = false)
      const result = await this.deleteEventLogic(eventId, false, req.userId);

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
