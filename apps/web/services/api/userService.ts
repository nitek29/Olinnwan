import { ApiClient } from '../client';
import { User } from '../../types/user';

export interface UpdateUserData {
  username?: string;
  mail?: string;
  password?: string;
}

export class UserService {
  private axios;

  constructor(axios: ApiClient) {
    this.axios = axios.instance;
  }

  public async getCurrentUser(): Promise<User> {
    const response = await this.axios.get<User>('/auth/me');
    return response.data;
  }

  public async updateUser(userData: UpdateUserData): Promise<User> {
    const response = await this.axios.patch<User>('/auth/me', userData);
    return response.data;
  }
}
