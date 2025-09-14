import apiClient from './client'

const payoutAPI = {
  getDashboard: async (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    const res = await apiClient.get(`v1/seller/payout/dashboard${qs ? `?${qs}` : ''}`)
    return res?.data || res
  },
  getHistory: async (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    const res = await apiClient.get(`v1/seller/payout/history${qs ? `?${qs}` : ''}`)
    return res?.data || res
  },
  requestPayout: async (notes) => {
    const payload = notes ? { notes } : {}
    const res = await apiClient.post('v1/seller/payout/request', payload)
    return res?.data || res
  },
  updateMethod: async (payload) => {
    const res = await apiClient.put('v1/seller/payout/method', payload)
    return res?.data || res
  },
  getEligibleEarnings: async (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    const res = await apiClient.get(`v1/seller/payout/eligible-earnings${qs ? `?${qs}` : ''}`)
    return res?.data || res
  }
}

export default payoutAPI
