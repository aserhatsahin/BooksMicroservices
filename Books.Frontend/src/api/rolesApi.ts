import { usersClient } from './client';
import type { RoleResponse, RoleCreateRequest, CommandResponse } from '../types';

export const getRoles = () =>
  usersClient.get<RoleResponse[]>('/api/Roles').then((r) => Array.isArray(r.data) ? r.data : []);

export const createRole = (data: RoleCreateRequest) =>
  usersClient.post<CommandResponse>('/api/Roles', data);

export const updateRole = (data: RoleCreateRequest & { id: number }) =>
  usersClient.put<CommandResponse>('/api/Roles', data);

export const deleteRole = (id: number) =>
  usersClient.delete<CommandResponse>(`/api/Roles/${id}`);
