import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import api from '@/lib/api'

export const useSellerProfile = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await api.get('/seller/profile')
        setData(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching seller profile:', err)
        setError(err.message || 'Failed to fetch seller profile')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSellerProfile()
  }, [user])

  const refetch = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await api.get('/seller/profile')
      setData(response.data)
      setError(null)
    } catch (err) {
      console.error('Error refetching seller profile:', err)
      setError(err.message || 'Failed to fetch seller profile')
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    refetch
  }
}