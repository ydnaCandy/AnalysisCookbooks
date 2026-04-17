import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from '../api/comments'
import { useAuth } from './useAuth'

export function useComments(recipeId: number) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const key = ['comments', recipeId]

  const query = useQuery({ queryKey: key, queryFn: () => commentsApi.list(recipeId) })

  const create = useMutation({
    mutationFn: (content: string) => commentsApi.create(recipeId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      commentsApi.update(id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation({
    mutationFn: (id: number) => commentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { comments: query.data ?? [], create, update, remove, currentUser: user }
}
