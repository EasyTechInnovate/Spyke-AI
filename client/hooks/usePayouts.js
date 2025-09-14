// filepath: client/hooks/usePayouts.js
'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import payoutAPI from '@/lib/api/payout'

export function usePayouts(options = {}) {
  const { autoLoadDashboard = true } = options
  const [dashboard, setDashboard] = useState(null)
  const [history, setHistory] = useState([])
  const [historyPagination, setHistoryPagination] = useState(null)
  const [eligible, setEligible] = useState(null)

  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingRequest, setLoadingRequest] = useState(false)
  const [updatingMethod, setUpdatingMethod] = useState(false)
  const [loadingEligible, setLoadingEligible] = useState(false)

  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const loadDashboard = useCallback(async (params = {}) => {
    if (!payoutAPI) {
      console.warn('payoutAPI not loaded')
      return
    }
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoadingDashboard(true)
    setError(null)
    try {
      const data = await payoutAPI.getDashboard(params)
      setDashboard(data)
      return data
    } catch (e) {
      setError(e?.message || 'Failed to load payout dashboard')
      throw e
    } finally {
      setLoadingDashboard(false)
    }
  }, [])

  const loadHistory = useCallback(async (params = {}) => {
    if (!payoutAPI) return
    setLoadingHistory(true)
    setError(null)
    try {
      const data = await payoutAPI.getHistory(params)
      setHistory(data?.payouts || data?.data?.payouts || [])
      setHistoryPagination(data?.pagination || data?.data?.pagination || null)
      return data
    } catch (e) {
      setError(e?.message || 'Failed to load payout history')
      throw e
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const loadEligible = useCallback(async (params = {}) => {
    if (!payoutAPI) return
    setLoadingEligible(true)
    setError(null)
    try {
      const data = await payoutAPI.getEligibleEarnings(params)
      setEligible(data)
      return data
    } catch (e) {
      setError(e?.message || 'Failed to calculate eligible earnings')
      throw e
    } finally {
      setLoadingEligible(false)
    }
  }, [])

  const requestPayout = useCallback(async (notes) => {
    if (!payoutAPI) return
    setLoadingRequest(true)
    setError(null)
    try {
      const res = await payoutAPI.requestPayout(notes)
      // Refresh dashboard after request
      await loadDashboard()
      return res
    } catch (e) {
      setError(e?.message || 'Failed to request payout')
      throw e
    } finally {
      setLoadingRequest(false)
    }
  }, [loadDashboard])

  const updateMethod = useCallback(async (payload) => {
    if (!payoutAPI) return
    setUpdatingMethod(true)
    setError(null)
    try {
      const res = await payoutAPI.updateMethod(payload)
      // Refresh dashboard to reflect possible canRequestPayout change
      await loadDashboard()
      return res
    } catch (e) {
      setError(e?.message || 'Failed to update payout method')
      throw e
    } finally {
      setUpdatingMethod(false)
    }
  }, [loadDashboard])

  useEffect(() => {
    if (autoLoadDashboard) {
      loadDashboard()
    }
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [autoLoadDashboard, loadDashboard])

  return {
    // data
    dashboard,
    history,
    historyPagination,
    eligible,
    // loading flags
    loadingDashboard,
    loadingHistory,
    loadingRequest,
    updatingMethod,
    loadingEligible,
    // error
    error,
    // actions
    loadDashboard,
    loadHistory,
    loadEligible,
    requestPayout,
    updateMethod
  }
}

export default usePayouts
