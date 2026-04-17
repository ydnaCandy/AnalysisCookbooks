import { client } from './client'
import type { User } from '../types'

export const usersApi = {
  list: () => client.get<User[]>('/users'),
  create: (data: { username: string; password: string; is_admin: boolean }) =>
    client.post<User>('/users', data),
  update: (id: number, data: { username?: string; is_admin?: boolean; is_active?: boolean }) =>
    client.put<User>(`/users/${id}`, data),
  resetPassword: (id: number, newPassword: string) =>
    client.post<void>(`/users/${id}/reset-password`, { new_password: newPassword }),
}
