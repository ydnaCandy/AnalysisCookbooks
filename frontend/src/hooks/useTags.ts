import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi } from '../api/tags'

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: tagsApi.list })
}

export function useTagMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tags'] })

  const create = useMutation({ mutationFn: tagsApi.create, onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      tagsApi.update(id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: tagsApi.delete, onSuccess: invalidate })

  return { create, update, remove }
}
