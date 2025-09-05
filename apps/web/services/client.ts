import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true, // Pour envoyer les cookies
    });
  }

  get instance() {
    return this.axiosInstance;
  }
}
