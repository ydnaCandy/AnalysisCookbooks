import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipesApi, type RecipeCreateInput, type RecipeUpdateInput } from '../api/recipes'

export function useRecipes(params?: { domain_id?: number; tag_id?: number }) {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipesApi.list(params),
  })
}

export function useRecipeMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['recipes'] })

  const create = useMutation({ mutationFn: (data: RecipeCreateInput) => recipesApi.create(data), onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecipeUpdateInput }) =>
      recipesApi.update(id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: recipesApi.delete, onSuccess: invalidate })

  return { create, update, remove }
}
