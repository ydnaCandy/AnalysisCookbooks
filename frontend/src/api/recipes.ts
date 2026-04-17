import { client } from './client'
import type { Recipe } from '../types'

export interface RecipeCreateInput {
  title: string
  description?: string
  sql_text: string
  domain_id: number
  tag_ids: number[]
}

export interface RecipeUpdateInput {
  title?: string
  description?: string
  sql_text?: string
  domain_id?: number
  tag_ids?: number[]
}

export const recipesApi = {
  list: (params?: { domain_id?: number; tag_id?: number }) => {
    const query = new URLSearchParams()
    if (params?.domain_id) query.set('domain_id', String(params.domain_id))
    if (params?.tag_id) query.set('tag_id', String(params.tag_id))
    const qs = query.toString()
    return client.get<Recipe[]>(`/recipes${qs ? `?${qs}` : ''}`)
  },
  get: (id: number) => client.get<Recipe>(`/recipes/${id}`),
  create: (data: RecipeCreateInput) => client.post<Recipe>('/recipes', data),
  update: (id: number, data: RecipeUpdateInput) => client.put<Recipe>(`/recipes/${id}`, data),
  delete: (id: number) => client.delete<void>(`/recipes/${id}`),
}
