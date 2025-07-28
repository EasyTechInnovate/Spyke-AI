'use client'

import { useEffect } from 'react'

export function useDebugAuth() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      const roles = localStorage.getItem('roles')
      
      console.log('=== AUTH DEBUG ===')
      console.log('Has authToken:', !!authToken)
      console.log('User:', user)
      console.log('Roles:', roles)
      console.log('Cookies:', document.cookie)
      console.log('==================')
    }
  }, [])
}