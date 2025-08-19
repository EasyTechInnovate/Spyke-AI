'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { logout } from '@/lib/services/logout'
import api from '@/lib/api'
import { useCart } from './useCart'

export function useHeader() {
    const router = useRouter()
    const pathname = usePathname()
    const { cartCount } = useCart()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [currentRole, setCurrentRole] = useState('user')
    const [userRoles, setUserRoles] = useState([])
    const [notifications, setNotifications] = useState(0)
    const [searchOpen, setSearchOpen] = useState(false)

    const dropdownRef = useRef(null)

    useEffect(() => {
        const loadUserFromStorage = () => {
            if (typeof window === 'undefined') return

            const token = localStorage.getItem('authToken')
            const userStr = localStorage.getItem('user')
            const rolesStr = localStorage.getItem('roles')

            if (token && userStr) {
                try {
                    const parsed = JSON.parse(userStr)
                    setUser(parsed)

                    const roles = rolesStr ? JSON.parse(rolesStr) : []
                    setUserRoles(roles)

                    if (pathname?.startsWith('/seller') || pathname?.startsWith('/dashboard')) {
                        setCurrentRole('seller')
                    } else {
                        setCurrentRole('user')
                    }
                } catch {
                    if (process.env.NODE_ENV === 'development') {
                        // Failed to parse user data
                    }
                    handleClearUser()
                }
            } else {
                handleClearUser()
            }
        }

        loadUserFromStorage()
        window.addEventListener('storage', loadUserFromStorage)
        return () => window.removeEventListener('storage', loadUserFromStorage)
    }, [pathname])

    // Fetch notifications count
    const fetchNotifications = async () => {
        try {
            const response = await api.notifications.getUnreadCount()
            setNotifications(response?.data?.count || 0)
        } catch (err) {
            if (process.env.NODE_ENV === 'development') {
                // Notifications fetch error
            }
        }
    }

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

    // Keyboard shortcuts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const handleKeyDown = (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault()
                    setSearchOpen(true)
                }
                // Close search with Escape
                if (e.key === 'Escape' && searchOpen) {
                    setSearchOpen(false)
                }
            }

            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [searchOpen])

    const handleClearUser = () => {
        setUser(null)
        setUserRoles([])
        setNotifications(0)
    }

    const handleLogout = async () => {
        handleClearUser()
        setDropdownOpen(false)
        await logout()
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
        isSeller: userRoles.includes('seller'),
        showBecomeSeller: !userRoles.includes('seller') && currentRole === 'user'
    }
}
