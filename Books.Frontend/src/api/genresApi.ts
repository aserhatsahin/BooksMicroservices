import { booksClient } from './client';
import type { GenreResponse, GenreCreateRequest, CommandResponse } from '../types';

export const getGenres = () =>
  booksClient.get<GenreResponse[]>('/api/Genres').then((r) => Array.isArray(r.data) ? r.data : []);

export const createGenre = (data: GenreCreateRequest) =>
  booksClient.post<CommandResponse>('/api/Genres', data);

export const updateGenre = (data: GenreCreateRequest & { id: number }) =>
  booksClient.put<CommandResponse>('/api/Genres', data);

export const deleteGenre = (id: number) =>
  booksClient.delete<CommandResponse>(`/api/Genres/${id}`);
