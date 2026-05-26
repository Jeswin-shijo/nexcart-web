import apiClient from './client';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  redirectTo: string;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data;
}
