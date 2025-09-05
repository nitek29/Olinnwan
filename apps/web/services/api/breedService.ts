import { ApiClient } from '../client';
import { Breed } from '../../types/breed';

export class BreedService {
  private axios;

  constructor(axios: ApiClient) {
    this.axios = axios.instance;
  }

  public async getBreeds(): Promise<Breed[]> {
    const response = await this.axios.get<Breed[]>('/breeds');
    return response.data;
  }
}
