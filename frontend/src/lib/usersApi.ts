import { apiFetch } from './api';

export interface UserItem {
  id: string;
  email: string;
  roles: string[];
  emailConfirmed: boolean;
  twoFactorEnabled: boolean;
  supporterId: number | null;
}

export function fetchUsers(): Promise<UserItem[]> {
  return apiFetch<UserItem[]>('/auth/users');
}

export function createUser(
  email: string,
  password: string,
  role: string
): Promise<UserItem> {
  return apiFetch<UserItem>('/auth/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

export function changeUserRole(
  id: string,
  role: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/auth/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/auth/users/${id}`, {
    method: 'DELETE',
  });
}

export function linkUserToSupporter(id: string): Promise<{ message: string; supporterId?: number }> {
  return apiFetch<{ message: string; supporterId?: number }>(`/auth/users/${id}/link-supporter`, {
    method: 'POST',
  });
}
