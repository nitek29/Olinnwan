import { Tag } from './tag';
import { Server } from './server';
import { Character } from './character';
import { User } from './user';

export type Event = {
  id: string;
  title: string;
  date: Date;
  duration: number;
  area?: string;
  sub_area?: string;
  donjon_name?: string;
  description?: string;
  max_players: number;
  status: string;
  tag?: Tag;
  server?: Server;
  characters?: Character[];
  user?: User;
};

export type EventEnriched = Event & {
  tag: Tag;
  server: Server;
  characters: Character[];
  user: User;
};

export type PaginatedEvents = {
  events: Event[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
