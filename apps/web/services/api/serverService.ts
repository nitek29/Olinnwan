import { ApiClient } from '../client';
import { Server } from '../../types/server';

export class ServerService {
  private axios;

  constructor(axios: ApiClient) {
    this.axios = axios.instance;
  }

  public async getServers(): Promise<Server[]> {
    const response = await this.axios.get<Server[]>('/servers');
    return response.data;
  }
}
