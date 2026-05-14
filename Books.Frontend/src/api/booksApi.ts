import { booksClient } from './client';
import type { BookResponse, BookCreateRequest, CommandResponse } from '../types';

export const getBooks = () =>
  booksClient.get<BookResponse[]>('/api/Books').then((r) => Array.isArray(r.data) ? r.data : []);

export const getBook = (id: number) =>
  booksClient.get<BookResponse>(`/api/Books/${id}`).then((r) => r.data);

export const createBook = (data: BookCreateRequest) =>
  booksClient.post<CommandResponse>('/api/Books', data);

export const updateBook = (data: BookCreateRequest & { id: number }) =>
  booksClient.put<CommandResponse>('/api/Books', data);

export const deleteBook = (id: number) =>
  booksClient.delete<CommandResponse>(`/api/Books/${id}`);
