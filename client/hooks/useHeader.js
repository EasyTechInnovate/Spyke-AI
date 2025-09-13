'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './useAuth'
import { useCart } from './useCart'
import { logoutService } from '@/lib/services/logout'


export function useHeader() {
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAuthenticated, logout, getUserRoles, hasRole } = useAuth()
    const { cartCount } = useCart()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [currentRole, setCurrentRole] = useState('user')
    const [notifications, setNotifications] = useState(0)
    const [searchOpen, setSearchOpen] = useState(false)

    const dropdownRef = useRef(null)

    // Get user roles from centralized auth
    const userRoles = getUserRoles()

    // Set current role based on pathname
    useEffect(() => {
        if (pathname?.startsWith('/seller') || pathname?.startsWith('/dashboard')) {
            setCurrentRole('seller')
        } else {
            setCurrentRole('user')
        }
    }, [pathname])

    // Fetch notifications count
    const fetchNotifications = async () => {
        if (!isAuthenticated) return

        try {
            const { authAPI } = await import('@/lib/api/auth')
            const response = await authAPI.getNotifications({ limit: 1 })
            setNotifications(response?.unreadCount || 0)
        } catch (err) {
            // Silent fail for notifications
            if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to fetch notifications:', err)
            }
        }
    }

    // Load notifications when user is authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchNotifications()
        } else {
            setNotifications(0)
        }
    }, [isAuthenticated, user])

    // Handle scroll
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleScroll = () => setScrolled(window.scrollY > 50)
            window.addEventListener('scroll', handleScroll)
            return () => window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        if (typeof window !== 'undefined' && dropdownOpen) {
            const closeDropdown = (e) => {
                if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                    setDropdownOpen(false)
                }
            }
            document.addEventListener('mousedown', closeDropdown)
            return () => document.removeEventListener('mousedown', closeDropdown)
        }
    }, [dropdownOpen])

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    const handleLogout = async () => {
        setDropdownOpen(false)

        try {
            await logoutService.logout()
        } catch (error) {
            console.error('Header logout error:', error)
            logoutService.forceLogout()
        }
    }

    const switchRole = (role) => {
        setCurrentRole(role)
        setDropdownOpen(false)

        if (role === 'seller') {
            router.push('/seller/profile')
        } else {
            router.push('/purchases')
        }
    }

    return {
        // State
        mobileMenuOpen,
        setMobileMenuOpen,
        scrolled,
        user,
        dropdownOpen,
        setDropdownOpen,
        cartCount,
        currentRole,
        userRoles,
        notifications,
        searchOpen,
        setSearchOpen,
        dropdownRef,
        handleLogout,
        switchRole,
        fetchNotifications,
        isAuthenticated,
        isSeller: hasRole('seller'),
        showBecomeSeller: !isAuthenticated || !hasRole('seller')
    }
}

