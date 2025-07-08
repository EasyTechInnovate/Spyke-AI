'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
    Menu,
    X,
    Search,
    ShoppingCart,
    Users,
    TrendingUp,
    User,
    Package,
    Settings,
    LogOut,
    ChevronDown,
    Store,
    Briefcase,
    Bell,
    DollarSign,
    BarChart3,
    MessageSquare,
    Zap,
    ChevronRight,
    Star,
    Heart,
    TrendingUpIcon,
    History,
    Sparkles,
    Tag,
    Mic
} from 'lucide-react'
import Container from './Container'
import { SpykeLogo } from '@/components/Logo'
import { toast } from 'sonner'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    const [currentRole, setCurrentRole] = useState('user')
    const [userRoles, setUserRoles] = useState([])
    const [notifications, setNotifications] = useState(3)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [recentSearches, setRecentSearches] = useState(['ChatGPT Prompts', 'AI Writing Tools', 'Marketing Automation'])
    const [isListening, setIsListening] = useState(false)
    const [voiceSupported, setVoiceSupported] = useState(false)
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    const navigation = [
        { name: 'Explore', href: '/explore' },
        { name: 'Categories', href: '/categories' },
        { name: 'Top Creators', href: '/creators' },
        { name: 'Hire', href: '/hire', icon: Users }
    ]

    const userMenuItems = [
        { name: 'My Purchases', href: '/account/purchases', icon: Package, badge: '2 new' },
        { name: 'Wishlist', href: '/account/wishlist', icon: Heart, badge: null },
        { name: 'Messages', href: '/account/messages', icon: MessageSquare, badge: '5' },
        { name: 'Profile', href: '/account/profile', icon: User, progress: 75 },
        { name: 'Settings', href: '/account/settings', icon: Settings, badge: null }
    ]

    const sellerMenuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Briefcase, badge: null },
        { name: 'My Products', href: '/seller/products', icon: Package, badge: '12 active' },
        { name: 'Analytics', href: '/seller/analytics', icon: BarChart3, badge: 'New data' },
        { name: 'Earnings', href: '/seller/earnings', icon: DollarSign, badge: null },
        { name: 'Messages', href: '/seller/messages', icon: MessageSquare, badge: '8' },
        { name: 'Settings', href: '/seller/settings', icon: Settings, badge: null }
    ]

    // Mock user data with more details
    const mockUserData = {
        ...user,
        level: 'Pro Seller',
        rating: 4.8,
        totalSales: 127,
        earnings: '$12,456',
        pendingBalance: '$1,234',
        memberSince: 'Jan 2024'
    }

    // ... [keeping all the useEffect hooks and other functions unchanged] ...

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
                    localStorage.removeItem('user')
                    setUser(null)
                    setUserRoles([])
                }
            } else {
                setUser(null)
                setCartCount(0)
                setUserRoles([])
            }
        }

        loadUserFromStorage()
        window.addEventListener('storage', loadUserFromStorage)
        return () => window.removeEventListener('storage', loadUserFromStorage)
    }, [pathname])

    const fetchCartCount = async () => {
        try {
            setCartCount(2)
        } catch (err) {
            console.error('Cart fetch error:', err)
        }
    }

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

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

    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    // Search functionality
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Open search with Cmd/Ctrl + K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen(true)
                setIsListening(false)
            }
            // Close search with Escape
            if (e.key === 'Escape' && searchOpen) {
                setSearchOpen(false)
                setIsListening(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [searchOpen])

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [searchOpen])

    // Voice Search Setup
    useEffect(() => {
        // Check if browser supports speech recognition
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            setVoiceSupported(!!SpeechRecognition)
        }
    }, [])

    // Voice search handler
    const handleVoiceSearch = () => {
        if (!voiceSupported) {
            toast.error('Voice search is not supported in your browser')
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
            setIsListening(true)
            toast.info('Listening... Speak now')
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setSearchQuery(transcript)
            setIsListening(false)
            toast.success(`Searching for: "${transcript}"`)
        }

        recognition.onerror = (event) => {
            setIsListening(false)
            if (event.error === 'no-speech') {
                toast.error('No speech detected. Please try again.')
            } else if (event.error === 'not-allowed') {
                toast.error('Microphone access denied. Please enable it in your browser settings.')
            } else {
                toast.error(`Error: ${event.error}`)
            }
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        if (isListening) {
            recognition.stop()
        } else {
            recognition.start()
        }
    }

    // Mock search function - replace with actual API call
    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults([])
            return
        }

        setIsSearching(true)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Mock search results
        const mockResults = {
            products: [
                {
                    id: 1,
                    title: 'ChatGPT Mega Prompts Bundle',
                    description: '500+ premium prompts for content creation',
                    price: '$49',
                    rating: 4.8,
                    sales: 1234,
                    image: '/api/placeholder/80/80',
                    category: 'AI Prompts'
                },
                {
                    id: 2,
                    title: 'AI Writing Assistant Tool',
                    description: 'Complete automation for blog writing',
                    price: '$99',
                    rating: 4.9,
                    sales: 567,
                    image: '/api/placeholder/80/80',
                    category: 'Automation'
                }
            ],
            categories: [
                { name: 'ChatGPT Prompts', count: 234 },
                { name: 'Content Creation', count: 123 }
            ],
            creators: [{ name: 'John Doe', products: 45, rating: 4.9 }]
        }

        setSearchResults(mockResults)
        setIsSearching(false)
    }

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(searchQuery)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleSearchSelect = (item) => {
        // Save to recent searches
        const updatedRecent = [item.title, ...recentSearches.filter((s) => s !== item.title)].slice(0, 5)
        setRecentSearches(updatedRecent)

        // Navigate to product
        router.push(`/product/${item.id}`)
        setSearchOpen(false)
        setSearchQuery('')
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
            setUser(null)
            setCartCount(0)
            setDropdownOpen(false)
            setUserRoles([])
            window.dispatchEvent(new Event('storage'))
            toast.success('Logged out successfully')
            router.push('/')
        }
    }

    const getInitials = (name, email) => {
        const displayName = getDisplayName(name, email)
        if (!displayName) return 'U'
        return displayName
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
    }

    const getDisplayName = (name, email) => {
        // If name exists and is not null, use it
        if (name && name.trim()) return name

        // If email exists, extract name from email
        if (email) {
            // Get the part before @ symbol
            const emailName = email.split('@')[0]

            // Replace common separators with spaces and capitalize
            const formattedName = emailName
                .replace(/[\._\-\+\d]/g, ' ') // Replace separators and numbers with spaces
                .split(' ')
                .filter((part) => part.length > 0) // Remove empty parts
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) // Capitalize each part
                .join(' ')

            return formattedName || emailName // Fallback to original if formatting fails
        }

        return null
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

    const isSeller = userRoles.includes('seller')
    const showBecomeSeller = !isSeller && currentRole === 'user'

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-black/95 backdrop-blur-lg shadow-2xl shadow-brand-primary/10 border-b border-brand-primary/20'
                        : 'bg-black/90 backdrop-blur-sm border-b border-white/10'
                }`}>
                <Container>
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* UPDATED LOGO SECTION - NOW LARGER AND MORE PROMINENT */}
                        <Link
                            href="/"
                            className="flex items-center z-10 group">
                            <div className="hidden sm:block">
                                <SpykeLogo
                                    size={56} // Increased from 40 to 56 for desktop
                                    showText={true} // Now showing text on desktop
                                    textSize="text-2xl" // Larger text
                                    darkMode={true} // Since header is dark
                                    priority={true} // Load immediately
                                    className="[&_span]:!text-white [&_div]:!text-gray-400 group-hover:[&_span]:!text-brand-primary transition-all duration-300"
                                />
                            </div>
                            {/* Mobile Logo - Icon only */}
                            <div className="sm:hidden">
                                <SpykeLogo
                                    size={48} // Slightly smaller on mobile
                                    showText={false} // Icon only on mobile to save space
                                    darkMode={true}
                                    priority={true}
                                    className="group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </Link>

                        {/* Navigation - Hide when search is open */}
                        <nav
                            className={`hidden lg:flex items-center space-x-4 xl:space-x-6 2xl:space-x-8 transition-all duration-300 ${
                                searchOpen ? 'opacity-0 invisible' : 'opacity-100 visible'
                            }`}>
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center gap-2 font-kumbh-sans font-medium text-base xl:text-lg text-gray-300 hover:text-brand-primary transition-all duration-300">
                                    {item.icon && <item.icon className="h-4 w-4 xl:h-5 xl:w-5 opacity-70 group-hover:opacity-100" />}
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                            {showBecomeSeller && (
                                <Link
                                    href="/become-seller"
                                    className="group flex items-center gap-2 font-kumbh-sans font-medium text-base xl:text-lg text-brand-primary hover:text-white transition-all duration-300">
                                    <TrendingUp className="h-4 w-4 xl:h-5 xl:w-5 opacity-70 group-hover:opacity-100" />
                                    <span>Become a seller</span>
                                </Link>
                            )}
                        </nav>

                        {/* Rest of the header remains the same... */}
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                            <button
                                type="button"
                                className="p-2 sm:p-3 text-gray-300 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300 relative group"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setSearchOpen(true)
                                    setIsListening(false)
                                }}>
                                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    ⌘K
                                </span>
                            </button>

                            {user && (
                                <>
                                    {/* Notifications */}
                                    <button className="relative p-2 sm:p-3 text-gray-300 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300">
                                        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {notifications > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                                                {notifications}
                                            </span>
                                        )}
                                    </button>

                                    {/* Cart */}
                                    <Link
                                        href="/cart"
                                        className="relative p-2 sm:p-3 text-gray-300 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300">
                                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-brand-primary text-black text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}

                            {user ? (
                                <div
                                    className="relative hidden md:block"
                                    ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/5 hover:bg-brand-primary/10 transition-all duration-300">
                                        {isSeller && (
                                            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-brand-primary/20 rounded-md">
                                                {currentRole === 'seller' ? (
                                                    <Store className="w-3 h-3 sm:w-4 sm:h-4 text-brand-primary" />
                                                ) : (
                                                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-brand-primary" />
                                                )}
                                                <span className="text-xs sm:text-sm font-medium text-brand-primary">
                                                    {currentRole === 'seller' ? 'Seller' : 'Buyer'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-brand-primary to-green-400 flex items-center justify-center flex-shrink-0">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={getDisplayName(user.name, user.emailAddress || user.email)}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-black font-semibold text-xs sm:text-sm">
                                                    {getInitials(user.name, user.emailAddress)}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronDown
                                            className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Enhanced Dropdown Menu */}
                                    <AnimatePresence>
                                        {dropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900/98 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                                                {/* User Info Section - Enhanced */}
                                                <div className="px-5 py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-700">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-green-400 flex items-center justify-center flex-shrink-0">
                                                            {user.avatar ? (
                                                                <img
                                                                    src={user.avatar}
                                                                    alt={getDisplayName(user.name, user.emailAddress || user.email)}
                                                                    className="w-full h-full rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-black font-semibold text-base">
                                                                    {getInitials(user.name, user.emailAddress)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-base font-medium text-white flex items-center gap-2">
                                                                {getDisplayName(user.name, user.emailAddress || user.email)}
                                                                {isSeller && currentRole === 'seller' && (
                                                                    <span className="px-2 py-0.5 bg-brand-primary/20 text-brand-primary text-xs rounded-full font-medium">
                                                                        {mockUserData.level}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-gray-400 truncate">{user.emailAddress || user.email}</p>

                                                            {/* Quick Stats */}
                                                            {isSeller && currentRole === 'seller' && (
                                                                <div className="flex items-center gap-3 mt-2 text-xs">
                                                                    <span className="flex items-center gap-1 text-yellow-500">
                                                                        <Star className="w-3 h-3 fill-current" />
                                                                        {mockUserData.rating}
                                                                    </span>
                                                                    <span className="text-gray-400">{mockUserData.totalSales} sales</span>
                                                                    <span className="text-green-500 font-medium">{mockUserData.earnings}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Actions for Sellers */}
                                                {isSeller && currentRole === 'seller' && (
                                                    <div className="px-5 py-3 bg-gray-800/30 border-b border-gray-700">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                                                                <DollarSign className="w-5 h-5 text-green-500" />
                                                                <span className="text-xs text-gray-300">Withdraw</span>
                                                            </button>
                                                            <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                                                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                                                <span className="text-xs text-gray-300">Analytics</span>
                                                            </button>
                                                            <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                                                                <Zap className="w-5 h-5 text-yellow-500" />
                                                                <span className="text-xs text-gray-300">Boost</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Role Switcher - Improved */}
                                                {isSeller && (
                                                    <div className="p-3 border-b border-gray-700">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-2">Switch Mode</p>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => switchRole('user')}
                                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                                                                    currentRole === 'user'
                                                                        ? 'bg-brand-primary text-black font-medium shadow-lg shadow-brand-primary/20'
                                                                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                                                                }`}>
                                                                <User className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Buy Mode</span>
                                                            </button>
                                                            <button
                                                                onClick={() => switchRole('seller')}
                                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                                                                    currentRole === 'seller'
                                                                        ? 'bg-brand-primary text-black font-medium shadow-lg shadow-brand-primary/20'
                                                                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                                                                }`}>
                                                                <Store className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Sell Mode</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Menu Items - Enhanced */}
                                                <div className="py-2 max-h-[300px] overflow-y-auto">
                                                    {(currentRole === 'seller' && isSeller ? sellerMenuItems : userMenuItems).map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className="group flex items-center justify-between px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                                                            onClick={() => setDropdownOpen(false)}>
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                                                                    <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                                                                </div>
                                                                <span className="font-medium">{item.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {item.badge && (
                                                                    <span className="px-2 py-0.5 bg-brand-primary/20 text-brand-primary text-xs rounded-full font-medium">
                                                                        {item.badge}
                                                                    </span>
                                                                )}
                                                                {item.progress && (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-brand-primary rounded-full transition-all duration-300"
                                                                                style={{ width: `${item.progress}%` }}
                                                                            />
                                                                        </div>
                                                                        <span className="text-xs text-gray-500">{item.progress}%</span>
                                                                    </div>
                                                                )}
                                                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>

                                                {/* Bottom Actions */}
                                                <div className="border-t border-gray-700">
                                                    {/* Become a Seller CTA */}
                                                    {!isSeller && (
                                                        <Link
                                                            href="/become-seller"
                                                            className="flex items-center justify-between px-5 py-3 text-sm hover:bg-gray-800/50 transition-colors group"
                                                            onClick={() => setDropdownOpen(false)}>
                                                            <div className="flex items-center gap-3 text-brand-primary">
                                                                <div className="p-2 bg-brand-primary/10 rounded-lg">
                                                                    <Store className="h-4 w-4" />
                                                                </div>
                                                                <span className="font-medium">Become a Seller</span>
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary" />
                                                        </Link>
                                                    )}

                                                    {/* Logout */}
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border-t border-gray-700 group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                                                <LogOut className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                                                            </div>
                                                            <span className="font-medium">Log out</span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">⌘Q</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                                    <Link
                                        href="/signin"
                                        className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-green-400 rounded-xl opacity-75 blur transition duration-300 group-hover:opacity-100" />
                                        <span className="relative flex items-center px-5 sm:px-6 py-2.5 sm:py-3 bg-black rounded-xl text-brand-primary font-kumbh-sans font-semibold text-base sm:text-lg transition-all duration-300 hover:text-white">
                                            Sign In
                                        </span>
                                    </Link>
                                </div>
                            )}

                            <button
                                className="md:hidden p-2 sm:p-2.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                            </button>
                        </div>
                    </div>
                </Container>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-gray-700 max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <nav className="flex flex-col py-4">
                            {/* Navigation Links */}
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-gray-300 hover:text-brand-primary px-4 py-3 hover:bg-white/5 transition-all"
                                    onClick={() => setMobileMenuOpen(false)}>
                                    {item.icon && <item.icon className="h-5 w-5 opacity-70" />}
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                            {showBecomeSeller && (
                                <Link
                                    href="/become-seller"
                                    className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-brand-primary px-4 py-3 hover:bg-white/5 transition-all"
                                    onClick={() => setMobileMenuOpen(false)}>
                                    <TrendingUp className="h-5 w-5 opacity-70" />
                                    <span>Become a seller</span>
                                </Link>
                            )}

                            {user ? (
                                <>
                                    <div className="border-t border-gray-700 mt-4">
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 px-4 py-4">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-brand-primary to-green-400 flex items-center justify-center">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={getDisplayName(user.name, user.emailAddress || user.email)}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-black font-semibold text-sm sm:text-base">
                                                        {getInitials(user.name, user.emailAddress || user.email)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm sm:text-base font-medium text-white truncate">
                                                    {getDisplayName(user.name, user.emailAddress || user.email)}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-400 truncate">{user.emailAddress || user.email}</p>
                                            </div>
                                        </div>

                                        {/* Role Switcher for Mobile */}
                                        {isSeller && (
                                            <div className="px-4 pb-4">
                                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Switch Account</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => {
                                                            switchRole('user')
                                                            setMobileMenuOpen(false)
                                                        }}
                                                        className={`flex flex-col items-center justify-center gap-1 px-3 py-3 sm:py-4 rounded-lg transition-all ${
                                                            currentRole === 'user'
                                                                ? 'bg-brand-primary text-black font-medium'
                                                                : 'bg-gray-800/50 text-gray-300'
                                                        }`}>
                                                        <User className="w-5 h-5" />
                                                        <span className="text-xs sm:text-sm font-medium">Buyer</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            switchRole('seller')
                                                            setMobileMenuOpen(false)
                                                        }}
                                                        className={`flex flex-col items-center justify-center gap-1 px-3 py-3 sm:py-4 rounded-lg transition-all ${
                                                            currentRole === 'seller'
                                                                ? 'bg-brand-primary text-black font-medium'
                                                                : 'bg-gray-800/50 text-gray-300'
                                                        }`}>
                                                        <Store className="w-5 h-5" />
                                                        <span className="text-xs sm:text-sm font-medium">Seller</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cart Link - Mobile */}
                                        <Link
                                            href="/cart"
                                            className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-gray-300 px-4 py-3 hover:bg-white/5 transition-all"
                                            onClick={() => setMobileMenuOpen(false)}>
                                            <ShoppingCart className="h-5 w-5 opacity-70" />
                                            <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                                        </Link>

                                        {/* User/Seller Menu Items */}
                                        {(currentRole === 'seller' && isSeller ? sellerMenuItems : userMenuItems).map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-gray-300 px-4 py-3 hover:bg-white/5 transition-all"
                                                onClick={() => setMobileMenuOpen(false)}>
                                                <item.icon className="h-5 w-5 opacity-70" />
                                                <span>{item.name}</span>
                                            </Link>
                                        ))}

                                        {!isSeller && (
                                            <Link
                                                href="/become-seller"
                                                className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-brand-primary px-4 py-3 hover:bg-white/5 transition-all"
                                                onClick={() => setMobileMenuOpen(false)}>
                                                <Store className="h-5 w-5" />
                                                <span>Become a Seller</span>
                                            </Link>
                                        )}

                                        {/* Logout Button - Separated and prominent */}
                                        <div className="mt-4 px-4 pb-4 border-t border-gray-700 pt-4">
                                            <button
                                                onClick={() => {
                                                    handleLogout()
                                                    setMobileMenuOpen(false)
                                                }}
                                                className="w-full flex items-center justify-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-red-400 bg-red-500/10 rounded-lg py-3 hover:bg-red-500/20 transition-all">
                                                <LogOut className="h-5 w-5" />
                                                <span>Log out</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="border-t border-gray-700 pt-4 mt-4 px-4 pb-4 space-y-3 sm:space-y-4">
                                        <Link
                                            href="/signin"
                                            className="block font-kumbh-sans font-medium text-base sm:text-lg text-gray-300 hover:text-brand-primary py-2 transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}>
                                            Sign In
                                        </Link>
                                    </div>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            {/* Search Overlay remains the same... */}
            <AnimatePresence>
                {searchOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                            onClick={() => {
                                setSearchOpen(false)
                                setIsListening(false)
                            }}
                        />

                        {/* Search Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-0 left-0 right-0 z-[101] w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
                            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                                {/* Search Header */}
                                <div className="p-4 sm:p-6 border-b border-gray-700">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search products, prompts, tools..."
                                            className="w-full pl-12 sm:pl-14 pr-24 sm:pr-28 py-3 sm:py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-brand-primary transition-colors text-base sm:text-lg"
                                        />

                                        {/* Voice Search Button */}
                                        {voiceSupported && (
                                            <button
                                                onClick={handleVoiceSearch}
                                                className={`absolute right-12 sm:right-14 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all ${
                                                    isListening
                                                        ? 'text-brand-primary bg-brand-primary/10 animate-pulse'
                                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                                }`}
                                                title={isListening ? 'Stop listening' : 'Search by voice'}>
                                                {isListening ? (
                                                    <>
                                                        <Mic className="h-5 w-5" />
                                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                    </>
                                                ) : (
                                                    <Mic className="h-5 w-5" />
                                                )}
                                            </button>
                                        )}

                                        {/* Close Button */}
                                        <button
                                            onClick={() => {
                                                setSearchOpen(false)
                                                setIsListening(false)
                                            }}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Voice Search Indicator */}
                                    {isListening && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mt-3 flex items-center justify-center gap-2 text-brand-primary">
                                            <div className="flex gap-1">
                                                <motion.div
                                                    className="w-1 h-4 bg-brand-primary rounded-full"
                                                    animate={{ scaleY: [1, 1.5, 1] }}
                                                    transition={{ duration: 0.5, repeat: Infinity }}
                                                />
                                                <motion.div
                                                    className="w-1 h-4 bg-brand-primary rounded-full"
                                                    animate={{ scaleY: [1, 2, 1] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                                                />
                                                <motion.div
                                                    className="w-1 h-4 bg-brand-primary rounded-full"
                                                    animate={{ scaleY: [1, 1.5, 1] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                                                />
                                                <motion.div
                                                    className="w-1 h-4 bg-brand-primary rounded-full"
                                                    animate={{ scaleY: [1, 2, 1] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
                                                />
                                                <motion.div
                                                    className="w-1 h-4 bg-brand-primary rounded-full"
                                                    animate={{ scaleY: [1, 1.5, 1] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                                                />
                                            </div>
                                            <span className="text-sm">Listening...</span>
                                        </motion.div>
                                    )}

                                    {/* Quick Filters */}
                                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                                        <button className="px-3 py-1.5 bg-brand-primary/20 text-brand-primary rounded-lg text-sm font-medium hover:bg-brand-primary/30 transition-colors">
                                            All
                                        </button>
                                        <button className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700/50 transition-colors">
                                            Prompts
                                        </button>
                                        <button className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700/50 transition-colors">
                                            Tools
                                        </button>
                                        <button className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700/50 transition-colors">
                                            Templates
                                        </button>
                                        <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-gray-500">
                                            <span>Press</span>
                                            <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">ESC</kbd>
                                            <span>to close</span>
                                            {voiceSupported && (
                                                <>
                                                    <span className="mx-1">or</span>
                                                    <Mic className="w-3 h-3" />
                                                    <span>for voice</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Search Results */}
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {isSearching ? (
                                        <div className="p-8 text-center">
                                            <div className="inline-flex items-center gap-2 text-gray-400">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                                    <Sparkles className="h-5 w-5" />
                                                </motion.div>
                                                <span>Searching...</span>
                                            </div>
                                        </div>
                                    ) : searchQuery && searchResults.products?.length > 0 ? (
                                        <div>
                                            {/* Products Section */}
                                            <div className="p-4 sm:p-6">
                                                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                                    <Package className="h-4 w-4" />
                                                    Products
                                                </h3>
                                                <div className="space-y-2">
                                                    {searchResults.products.map((product) => (
                                                        <button
                                                            key={product.id}
                                                            onClick={() => handleSearchSelect(product)}
                                                            className="w-full p-3 sm:p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group">
                                                            <div className="flex items-start gap-3 sm:gap-4">
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.title}
                                                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover bg-gray-700"
                                                                />
                                                                <div className="flex-1 text-left">
                                                                    <h4 className="font-medium text-white group-hover:text-brand-primary transition-colors">
                                                                        {product.title}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">{product.description}</p>
                                                                    <div className="flex items-center gap-4 mt-2 text-xs">
                                                                        <span className="text-brand-primary font-semibold">{product.price}</span>
                                                                        <span className="flex items-center gap-1 text-yellow-500">
                                                                            <Star className="h-3 w-3 fill-current" />
                                                                            {product.rating}
                                                                        </span>
                                                                        <span className="text-gray-500">{product.sales} sales</span>
                                                                        <span className="px-2 py-0.5 bg-gray-700 rounded text-gray-300">
                                                                            {product.category}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Categories Section */}
                                            {searchResults.categories?.length > 0 && (
                                                <div className="p-4 sm:p-6 border-t border-gray-700">
                                                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                                        <Tag className="h-4 w-4" />
                                                        Categories
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {searchResults.categories.map((category) => (
                                                            <Link
                                                                key={category.name}
                                                                href={`/category/${category.name.toLowerCase().replace(' ', '-')}`}
                                                                onClick={() => setSearchOpen(false)}
                                                                className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-sm transition-colors group">
                                                                <span className="text-gray-300 group-hover:text-white">{category.name}</span>
                                                                <span className="text-gray-500 ml-1">({category.count})</span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : searchQuery && searchResults.products?.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="text-gray-400">
                                                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                                <p className="text-lg font-medium mb-1">No results found</p>
                                                <p className="text-sm">Try searching with different keywords</p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Recent & Trending Searches */
                                        <div className="p-4 sm:p-6">
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                {/* Recent Searches */}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                                        <History className="h-4 w-4" />
                                                        Recent Searches
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {recentSearches.map((search, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setSearchQuery(search)}
                                                                className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm">
                                                                {search}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Trending Searches */}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                                        <TrendingUpIcon className="h-4 w-4" />
                                                        Trending Now
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {['AI Writing Assistant', 'Social Media Templates', 'Email Marketing'].map((trend, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setSearchQuery(trend)}
                                                                className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm flex items-center justify-between group">
                                                                <span>{trend}</span>
                                                                <span className="text-xs text-gray-500 group-hover:text-brand-primary">
                                                                    +{Math.floor(Math.random() * 50 + 20)}%
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Voice Search Tip */}
                                            {voiceSupported && !searchQuery && (
                                                <div className="mt-6 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-brand-primary/20 rounded-lg">
                                                            <Mic className="h-5 w-5 text-brand-primary" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-brand-primary mb-1">Try Voice Search!</p>
                                                            <p className="text-xs text-gray-400">
                                                                Click the microphone icon or say "Hey, find me ChatGPT prompts for marketing"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
