import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { domainsApi } from '../api/domains'

export function useDomains() {
  return useQuery({ queryKey: ['domains'], queryFn: domainsApi.list })
}

export function useDomainMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['domains'] })

  const create = useMutation({ mutationFn: domainsApi.create, onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string } }) =>
      domainsApi.update(id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: domainsApi.delete, onSuccess: invalidate })

  return { create, update, remove }
}
