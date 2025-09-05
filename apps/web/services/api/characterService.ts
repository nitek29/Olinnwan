import { ApiClient } from '../client';
import { Character } from '../../types/character';

export interface CreateCharacterData {
  name: string;
  sex: string;
  level: number;
  alignment: string;
  stuff?: string;
  default_character: boolean;
  breed_id: string;
  server_id: string;
}

export class CharacterService {
  private axios;

  constructor(axios: ApiClient) {
    this.axios = axios.instance;
  }

  public async getAllCharactersByUserId(userId: string): Promise<Character[]> {
    const response = await this.axios.get<Character[]>(
      `/user/${userId}/characters`
    );
    return response.data;
  }

  public async getAllEnrichedCharactersByUserId(
    userId: string
  ): Promise<Character[]> {
    const response = await this.axios.get<Character[]>(
      `/user/${userId}/characters/enriched`
    );
    return response.data;
  }

  public async getCharacterByUserId(
    userId: string,
    characterId: string
  ): Promise<Character> {
    const response = await this.axios.get<Character>(
      `/user/${userId}/character/${characterId}`
    );
    return response.data;
  }

  public async getEnrichedCharacterByUserId(
    userId: string,
    characterId: string
  ): Promise<Character> {
    const response = await this.axios.get<Character>(
      `/user/${userId}/character/enriched/${characterId}`
    );
    return response.data;
  }

  public async getUserCharacters(): Promise<Character[]> {
    const response = await this.axios.get<Character[]>(`/characters`);
    return response.data;
  }

  public async createCharacter(
    characterData: CreateCharacterData
  ): Promise<Character> {
    const response = await this.axios.post<Character>(
      '/characters',
      characterData
    );
    return response.data;
  }

  public async updateCharacter(
    characterId: string,
    characterData: Partial<CreateCharacterData>
  ): Promise<Character> {
    const response = await this.axios.patch<Character>(
      `/character/${characterId}`,
      characterData
    );
    return response.data;
  }

  public async deleteCharacter(characterId: string): Promise<void> {
    await this.axios.delete(`/character/${characterId}`);
  }
}
