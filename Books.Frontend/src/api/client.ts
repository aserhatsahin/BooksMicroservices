import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { TokenResponse } from '../types';

export const booksClient = axios.create({ baseURL: import.meta.env.VITE_BOOKS_API_URL });
export const usersClient = axios.create({ baseURL: import.meta.env.VITE_USERS_API_URL });

// ── Auth request interceptor ──────────────────────────────────────────────────
const addAuthInterceptor = (client: typeof booksClient) => {
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = token;
    return config;
  });
};

addAuthInterceptor(booksClient);
addAuthInterceptor(usersClient);

// ── Refresh token response interceptor ───────────────────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

const flushQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

const isTokenEndpoint = (url?: string) =>
  url?.includes('/api/Token') || url?.includes('/api/RefreshToken');

const addRefreshInterceptor = (client: typeof booksClient) => {
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original: InternalAxiosRequestConfig & { _retry?: boolean } = error.config;
      if (error.response?.status !== 401 || original._retry || isTokenEndpoint(original.url)) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = token;
          return client(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token || !refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await usersClient.post<TokenResponse>('/api/RefreshToken', { token, refreshToken });
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        flushQueue(null, newToken);
        original.headers.Authorization = newToken;
        return client(original);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};

addRefreshInterceptor(booksClient);
addRefreshInterceptor(usersClient);
