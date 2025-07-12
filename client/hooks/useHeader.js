import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'

export function useHeader() {
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [cartCount, setCartCount] = useState(0)
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
                    fetchCartCount()

                    const roles = rolesStr ? JSON.parse(rolesStr) : []
                    setUserRoles(roles)

                    if (pathname?.startsWith('/seller') || pathname?.startsWith('/dashboard')) {
                        setCurrentRole('seller')
                    } else {
                        setCurrentRole('user')
                    }
                } catch {
                    console.error('Failed to parse user data')
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

    // Fetch cart count
    const fetchCartCount = async () => {
        try {
            const response = await api.cart.getCount()
            setCartCount(response.data.count || 0)
        } catch (err) {
            console.error('Cart fetch error:', err)
        }
    }

    // Fetch notifications count
    const fetchNotifications = async () => {
        try {
            const response = await api.notifications.getUnreadCount()
            setNotifications(response.data.count || 0)
        } catch (err) {
            console.error('Notifications fetch error:', err)
        }
    }

    // Handle scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close dropdown on outside click
    useEffect(() => {
        const closeDropdown = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        if (dropdownOpen) {
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
        const handleKeyDown = (e) => {
            // Open search with Cmd/Ctrl + K
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
    }, [searchOpen])

    const handleClearUser = () => {
        setUser(null)
        setCartCount(0)
        setUserRoles([])
        setNotifications(0)
    }

    const handleLogout = async () => {
        try {
            await api.auth.logout()
        } catch (err) {
            console.error('Logout failed:', err)
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                localStorage.removeItem('roles')
            }
            handleClearUser()
            setDropdownOpen(false)
            window.dispatchEvent(new Event('storage'))
            toast.success('Logged out successfully')
            router.push('/')
        }
    }

    const switchRole = (role) => {
        setCurrentRole(role)
        setDropdownOpen(false)

        if (role === 'seller') {
            router.push('/seller/profile')
        } else {
            router.push('/account/purchases')
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