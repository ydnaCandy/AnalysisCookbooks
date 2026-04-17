import { client } from './client'
import type { Tag } from '../types'

export const tagsApi = {
  list: () => client.get<Tag[]>('/tags'),
  create: (data: { name: string }) => client.post<Tag>('/tags', data),
  update: (id: number, data: { name: string }) => client.put<Tag>(`/tags/${id}`, data),
  delete: (id: number) => client.delete<void>(`/tags/${id}`),
}
