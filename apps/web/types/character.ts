import { Breed } from './breed';
import { Server } from './server';

export type Character = {
  id: string;
  name: string;
  sex: string;
  level: number;
  alignment: string;
  stuff: string;
  breed: Breed;
  server_id: string;
  default_character: boolean;
};
