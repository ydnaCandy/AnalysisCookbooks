import { client } from './client'
import type { Domain } from '../types'

export const domainsApi = {
  list: () => client.get<Domain[]>('/domains'),
  create: (data: { name: string; description?: string }) =>
    client.post<Domain>('/domains', data),
  update: (id: number, data: { name?: string; description?: string }) =>
    client.put<Domain>(`/domains/${id}`, data),
  delete: (id: number) => client.delete<void>(`/domains/${id}`),
}
