import { usersClient } from './client';
import type { UserResponse, UserCreateRequest, CommandResponse } from '../types';

export const getUsers = () =>
  usersClient.get<UserResponse[]>('/api/Users').then((r) => Array.isArray(r.data) ? r.data : []);

export const createUser = (data: UserCreateRequest) =>
  usersClient.post<CommandResponse>('/api/Users', data);

export const updateUser = (data: UserCreateRequest & { id: number }) =>
  usersClient.put<CommandResponse>('/api/Users', data);

export const deleteUser = (id: number) =>
  usersClient.delete<CommandResponse>(`/api/Users/${id}`);
