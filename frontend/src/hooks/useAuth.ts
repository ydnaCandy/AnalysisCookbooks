import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    enabled: !!localStorage.getItem('token'),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authApi.login(username, password),
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const logout = () => {
    localStorage.removeItem('token')
    queryClient.clear()
    window.location.href = '/login'
  }

  return { user, isLoading, loginMutation, logout }
}
