import { usersClient } from './client';
import type { TokenResponse } from '../types';

export const getToken = (userName: string, password: string) =>
  usersClient.post<TokenResponse>('/api/Token', { userName, password });

export const refreshToken = (token: string, refreshToken: string) =>
  usersClient.post<TokenResponse>('/api/RefreshToken', { token, refreshToken });
