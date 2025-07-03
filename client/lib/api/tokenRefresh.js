import apiClient from './client'

export async function refreshAccessToken() {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await apiClient.post('v1/auth/refresh-token', { refreshToken })

  if (response.accessToken) {
    apiClient.setAuthToken(response.accessToken)
  }

  if (response.refreshToken && typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', response.refreshToken)
  }

  return response
}
