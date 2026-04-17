import { client } from './client'
import type { Comment } from '../types'

export const commentsApi = {
  list: (recipeId: number) => client.get<Comment[]>(`/recipes/${recipeId}/comments`),
  create: (recipeId: number, content: string) =>
    client.post<Comment>(`/recipes/${recipeId}/comments`, { content }),
  update: (commentId: number, content: string) =>
    client.put<Comment>(`/comments/${commentId}`, { content }),
  delete: (commentId: number) => client.delete<void>(`/comments/${commentId}`),
}
