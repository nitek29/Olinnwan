import { ApiClient } from '../client';

import type { AuthUser } from '../../types/user';
import type { LoginForm, RegisterForm } from '../../types/form';

export class AuthService {
  private axios;

  constructor(axios: ApiClient) {
    this.axios = axios.instance;
  }

  public async register(data: RegisterForm): Promise<AuthUser> {
    const passwordRegex = new RegExp(
      '^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+=\\[\\]{};\'":\\\\|,.<>/?`~]).{8,}$'
    );

    if (!passwordRegex.test(data.password)) {
      throw new Error(
        'Le mot de passe ne respecte pas les conditions minimales de sécurité.'
      );
    }
    if (data.password !== data.confirmPassword) {
      throw new Error(
        'Le mot de passe et la confirmation doivent être identique.'
      );
    }

    try {
      const response = await this.axios.post<AuthUser>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error("Ce nom d'utilisateur ou email n'est pas disponible.");
      }
      throw error;
    }
  }

  public async login(data: LoginForm): Promise<AuthUser> {
    try {
      const response = await this.axios.post<AuthUser>('/auth/login', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
      }
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.axios.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  public async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await this.axios.get<AuthUser>('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        throw new Error('Non authentifié');
      }
      throw error;
    }
  }
}
