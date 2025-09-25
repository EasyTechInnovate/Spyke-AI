import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import sellerAPI from '@/lib/api/seller'

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
        const response = await sellerAPI.getProfile()
        
        const transformedData = {
          ...response,
          verificationStatus: response?.verification?.status || 'pending',
          isApproved: response?.verification?.status === 'approved',
          isCommissionAccepted: response?.commissionOffer?.status === 'accepted' && response?.commissionOffer?.acceptedAt,
        }
        
        setData(transformedData)
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
      const response = await sellerAPI.getProfile()
      
      const transformedData = {
        ...response,
        verificationStatus: response?.verification?.status || 'pending',
        isApproved: response?.verification?.status === 'approved',
        isCommissionAccepted: response?.commissionOffer?.status === 'accepted' && response?.commissionOffer?.acceptedAt,
      }
      
      setData(transformedData)
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