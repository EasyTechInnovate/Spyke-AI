import apiClient from './client'

export const analyticsApi = {
  // Send analytics events to backend
  sendEvents: async (events) => {
    return apiClient.post('/v1/analytics/events', { events })
  },

  // Get analytics events (admin only)
  getEvents: async (params = {}) => {
    return apiClient.get('/v1/analytics/events', { params })
  },

  // Get analytics stats (admin only)
  getStats: async (period = 'today') => {
    return apiClient.get('/v1/analytics/stats', { params: { period } })
  },

  // Clear all analytics events (admin only)
  clearEvents: async () => {
    return apiClient.delete('/v1/analytics/events')
  }
}