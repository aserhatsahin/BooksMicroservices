import { booksClient } from './client';
import type { AuthorResponse, AuthorCreateRequest, CommandResponse } from '../types';

export const getAuthors = () =>
  booksClient.get<AuthorResponse[]>('/api/Author').then((r) => Array.isArray(r.data) ? r.data : []);

export const createAuthor = (data: AuthorCreateRequest) =>
  booksClient.post<CommandResponse>('/api/Author', data);

export const updateAuthor = (data: AuthorCreateRequest & { id: number }) =>
  booksClient.put<CommandResponse>('/api/Author', data);

export const deleteAuthor = (id: number) =>
  booksClient.delete<CommandResponse>(`/api/Author/${id}`);
