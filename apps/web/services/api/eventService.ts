import { ApiClient } from '../client';

import { PaginatedEvents, Event, EventEnriched } from '../../types/event';

export class EventService {
  private axios;

  constructor(axios: ApiClient) {
    this.axios = axios.instance;
  }

  public async getEvents(
    limit?: number,
    page?: number
  ): Promise<PaginatedEvents> {
    const response = await this.axios.get<PaginatedEvents>('/events', {
      params: { limit, page },
    });
    return response.data;
  }

  public async getAllEnriched(): Promise<EventEnriched[]> {
    const response = await this.axios.get<EventEnriched[]>('/events/enriched');
    return response.data;
  }

  public async getEnrichedEvents(
    limit?: number,
    page?: number
  ): Promise<PaginatedEvents> {
    const response = await this.axios.get<PaginatedEvents>('/events/enriched', {
      params: { limit, page },
    });
    return response.data;
  }

  public async getEventById(eventId: string): Promise<Event> {
    const response = await this.axios.get<Event>(`/event/${eventId}`);
    return response.data;
  }

  public async getEnrichedEventById(eventId: string): Promise<EventEnriched> {
    const response = await this.axios.get<EventEnriched>(
      `/event/${eventId}/enriched`
    );
    return response.data;
  }

  public async createEvent(eventData: Partial<Event>): Promise<Event> {
    const response = await this.axios.post<Event>('/events', eventData);
    return response.data;
  }

  public async updateEvent(
    eventId: string,
    eventData: Partial<Event>
  ): Promise<Event> {
    const response = await this.axios.patch<Event>(
      `/event/${eventId}`,
      eventData
    );
    return response.data;
  }

  public async deleteEvent(eventId: string): Promise<void> {
    await this.axios.delete(`/event/${eventId}`);
  }

  // Admin methods
  public async adminUpdateEvent(
    userId: string,
    eventId: string,
    eventData: Partial<Event>
  ): Promise<EventEnriched> {
    const response = await this.axios.patch<EventEnriched>(
      `/user/${userId}/event/${eventId}`,
      eventData
    );
    return response.data;
  }

  public async adminDeleteEvent(
    userId: string,
    eventId: string
  ): Promise<void> {
    await this.axios.delete(`/user/${userId}/event/${eventId}`);
  }

  // Character management
  public async addCharactersToEvent(
    eventId: string,
    characterIds: string[]
  ): Promise<EventEnriched> {
    const response = await this.axios.post<EventEnriched>(
      `/event/${eventId}/addCharacters`,
      {
        characters_id: characterIds,
      }
    );
    return response.data;
  }

  public async removeCharactersFromEvent(
    eventId: string,
    characterIds: string[]
  ): Promise<EventEnriched> {
    const response = await this.axios.post<EventEnriched>(
      `/event/${eventId}/removeCharacters`,
      {
        characters_id: characterIds,
      }
    );
    return response.data;
  }
}
