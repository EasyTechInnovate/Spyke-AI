'use client'

import { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { Bell, Menu, Search, LogOut, Settings, ChevronDown, User } from 'lucide-react'
import { DESIGN_TOKENS } from '@/lib/design-system/tokens'
import { DSFormInput, DSBadge, DSHeading } from '@/lib/design-system'
import { logoutService } from '@/lib/services/logout'

const HEADER_TOKENS = {
    background: {
        main: DESIGN_TOKENS.colors.background.card.dark,
        elevated: DESIGN_TOKENS.colors.background.elevated
    },
    text: {
        primary: DESIGN_TOKENS.colors.text.inverse,
        secondary: DESIGN_TOKENS.colors.text.subtle,
        muted: DESIGN_TOKENS.colors.text.muted
    },
    border: {
        default: `${DESIGN_TOKENS.colors.brand.primary}1A`,
        focus: DESIGN_TOKENS.colors.brand.primary
    },
    brand: {
        primary: DESIGN_TOKENS.colors.brand.primary,
        primaryText: DESIGN_TOKENS.colors.brand.primaryText
    },
    animation: {
        duration: DESIGN_TOKENS.animation.duration.normal,
        easing: DESIGN_TOKENS.animation.easing.easeOut
    },
    spacing: {
        padding: DESIGN_TOKENS.spacing[4],
        gap: DESIGN_TOKENS.spacing[4]
    },
    zIndex: DESIGN_TOKENS.zIndex.dropdown - 100
}

const PAGE_TITLES = {
    '/admin/dashboard': 'Dashboard Overview',
    '/admin/sellers/pending': 'Pending Seller Approvals',
    '/admin/sellers/active': 'Active Sellers',
    '/admin/sellers/payouts': 'Payout Tracking',
    '/admin/products/pending': 'Pending Product Reviews',
    '/admin/products/flagged': 'Flagged Products',
    '/admin/products/featured': 'Featured Products',
    '/admin/promocodes': 'Promocode Management',
    '/admin/analytics': 'Analytics Dashboard',
    '/admin/compliance': 'Compliance Center',
    '/admin/settings': 'System Settings'
}

// Mobile Menu Button Component
const MobileMenuButton = memo(({ onClick }) => (
    <button
        onClick={onClick}
        className="lg:hidden flex items-center justify-center p-2 rounded-lg transition-all"
        style={{
            color: HEADER_TOKENS.text.secondary,
            backgroundColor: 'transparent',
            transitionDuration: HEADER_TOKENS.animation.duration
        }}
        onMouseEnter={(e) => {
            e.target.style.color = HEADER_TOKENS.text.primary
            e.target.style.backgroundColor = HEADER_TOKENS.background.elevated
        }}
        onMouseLeave={(e) => {
            e.target.style.color = HEADER_TOKENS.text.secondary
            e.target.style.backgroundColor = 'transparent'
        }}
        aria-label="Open sidebar menu"
        aria-expanded="false">
        <Menu className="w-6 h-6" />
    </button>
))
MobileMenuButton.displayName = 'MobileMenuButton'

// Search Bar Component
const SearchBar = memo(({ searchQuery, onSearchChange, onSearchSubmit }) => {
    const handleSubmit = useCallback(
        (e) => {
            e.preventDefault()
            onSearchSubmit?.(searchQuery)
        },
        [searchQuery, onSearchSubmit]
    )

    return (
        <form
            onSubmit={handleSubmit}
            className="relative flex-1 hidden md:flex max-w-md mx-4">
            <div className="relative w-full">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: HEADER_TOKENS.text.muted }}
                />
                <input
                    type="search"
                    placeholder="Search admin panel..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
                    style={{
                        backgroundColor: DESIGN_TOKENS.colors.background.dark,
                        borderColor: HEADER_TOKENS.border.default,
                        color: HEADER_TOKENS.text.primary,
                        focusRingColor: HEADER_TOKENS.border.focus
                    }}
                    aria-label="Search admin panel"
                    autoComplete="off"
                />
            </div>
        </form>
    )
})
SearchBar.displayName = 'SearchBar'

// Notification Bell Component
const NotificationBell = memo(({ notificationCount = 0 }) => (
    <button
        className="relative p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:bg-opacity-10"
        style={{
            color: HEADER_TOKENS.text.secondary,
            backgroundColor: 'transparent',
            transitionDuration: HEADER_TOKENS.animation.duration,
            focusRingColor: HEADER_TOKENS.border.focus
        }}
        onMouseEnter={(e) => {
            e.target.style.color = HEADER_TOKENS.text.primary
            e.target.style.backgroundColor = HEADER_TOKENS.background.elevated
        }}
        onMouseLeave={(e) => {
            e.target.style.color = HEADER_TOKENS.text.secondary
            e.target.style.backgroundColor = 'transparent'
        }}
        aria-label={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ''}`}
        title={`${notificationCount} unread notifications`}>
        <Bell className="w-5 h-5" />
        {notificationCount > 0 && (
            <span
                className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full text-xs font-medium"
                style={{
                    backgroundColor: DESIGN_TOKENS.colors.semantic.error,
                    color: HEADER_TOKENS.text.primary,
                    fontSize: DESIGN_TOKENS.typography.fontSize.xs,
                    padding: '2px 6px'
                }}
                aria-hidden="true">
                {notificationCount > 99 ? '99+' : notificationCount}
            </span>
        )}
    </button>
))
NotificationBell.displayName = 'NotificationBell'

// User Avatar Component
const UserAvatar = memo(({ userName = 'Admin', onClick }) => {
    const userInitial = useMemo(() => {
        return userName.charAt(0).toUpperCase()
    }, [userName])

    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{
                backgroundColor: HEADER_TOKENS.brand.primary,
                color: HEADER_TOKENS.brand.primaryText,
                fontFamily: DESIGN_TOKENS.typography.fontFamily.body,
                fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
                transitionDuration: HEADER_TOKENS.animation.duration,
                focusRingColor: HEADER_TOKENS.border.focus
            }}
            onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
            }}
            aria-label={`User menu for ${userName}`}
            title={`Logged in as ${userName}`}>
            {userInitial}
        </button>
    )
})
UserAvatar.displayName = 'UserAvatar'

// Profile Dropdown Component
const ProfileDropdown = memo(({ 
    userName = 'Admin', 
    userEmail = 'admin@spyke-ai.com', 
    isOpen, 
    onToggle, 
    onClose 
}) => {
    const dropdownRef = useRef(null)
    const userInitial = useMemo(() => userName.charAt(0).toUpperCase(), [userName])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    // Dropdown menu items
    const menuItems = [
        {
            id: 'profile',
            label: 'Profile Settings',
            icon: User,
            href: '/admin/profile',
            action: () => {
                console.log('Navigate to profile')
                onClose()
            }
        },
        {
            id: 'settings',
            label: 'System Settings',
            icon: Settings,
            href: '/admin/settings',
            action: () => {
                console.log('Navigate to settings')
                onClose()
            }
        },
        {
            id: 'divider',
            type: 'divider'
        },
        {
            id: 'logout',
            label: 'Sign Out',
            icon: LogOut,
            action: async () => {
                try {
                    await logoutService.logout()
                } catch (error) {
                    console.error('Logout failed:', error)
                }
                onClose()
            },
            variant: 'danger'
        }
    ]

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Escape') {
            onClose()
        }
    }, [onClose])

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
                onClick={onToggle}
                onKeyDown={handleKeyDown}
                className="flex items-center gap-2 p-1 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{
                    backgroundColor: isOpen ? HEADER_TOKENS.background.elevated : 'transparent',
                    transitionDuration: HEADER_TOKENS.animation.duration,
                    focusRingColor: HEADER_TOKENS.border.focus
                }}
                aria-label={`User menu for ${userName}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <div
                    className="flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all"
                    style={{
                        backgroundColor: HEADER_TOKENS.brand.primary,
                        color: HEADER_TOKENS.brand.primaryText,
                        fontFamily: DESIGN_TOKENS.typography.fontFamily.body,
                        fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
                        transform: isOpen ? 'scale(1.05)' : 'scale(1)'
                    }}
                >
                    {userInitial}
                </div>
                <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 hidden sm:block ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: HEADER_TOKENS.text.secondary }}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-lg transition-all duration-200 ${
                    isOpen 
                        ? 'opacity-100 scale-100 pointer-events-auto' 
                        : 'opacity-0 scale-95 pointer-events-none'
                }`}
                style={{
                    backgroundColor: HEADER_TOKENS.background.elevated,
                    borderColor: HEADER_TOKENS.border.default,
                    zIndex: DESIGN_TOKENS.zIndex.dropdown,
                    boxShadow: DESIGN_TOKENS.shadows.xl
                }}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
            >
                {/* User Info Header */}
                <div 
                    className="px-4 py-3 border-b"
                    style={{ borderColor: HEADER_TOKENS.border.default }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-full font-semibold"
                            style={{
                                backgroundColor: HEADER_TOKENS.brand.primary,
                                color: HEADER_TOKENS.brand.primaryText,
                                fontSize: DESIGN_TOKENS.typography.fontSize.base
                            }}
                        >
                            {userInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p 
                                className="font-medium truncate"
                                style={{ 
                                    color: HEADER_TOKENS.text.primary,
                                    fontSize: DESIGN_TOKENS.typography.fontSize.sm
                                }}
                            >
                                {userName}
                            </p>
                            <p 
                                className="text-xs truncate"
                                style={{ color: HEADER_TOKENS.text.muted }}
                            >
                                {userEmail}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                    {menuItems.map((item) => {
                        if (item.type === 'divider') {
                            return (
                                <div
                                    key={item.id}
                                    className="my-1 border-t"
                                    style={{ borderColor: HEADER_TOKENS.border.default }}
                                />
                            )
                        }

                        const Icon = item.icon
                        const isDanger = item.variant === 'danger'

                        return (
                            <button
                                key={item.id}
                                onClick={item.action}
                                className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-opacity-50"
                                style={{
                                    color: isDanger ? DESIGN_TOKENS.colors.semantic.error : HEADER_TOKENS.text.primary,
                                    focusRingColor: HEADER_TOKENS.border.focus
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = isDanger 
                                        ? `${DESIGN_TOKENS.colors.semantic.error}1A`
                                        : HEADER_TOKENS.background.main
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent'
                                }}
                                role="menuitem"
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span 
                                    className="text-sm font-medium"
                                    style={{ fontFamily: DESIGN_TOKENS.typography.fontFamily.body }}
                                >
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
})
ProfileDropdown.displayName = 'ProfileDropdown'

// Main AdminHeader Component
const AdminHeader = ({ setSidebarOpen, currentPath }) => {
    // Local state for search functionality
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

    // Memoized page title
    const pageTitle = useMemo(() => {
        return PAGE_TITLES[currentPath] || 'Admin Panel'
    }, [currentPath])

    // Search handlers
    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query)
    }, [])

    const handleSearchSubmit = useCallback((query) => {
        if (query.trim()) {
            // TODO: Implement search functionality
            console.log('Search query:', query)
            setMobileSearchOpen(false) // Close mobile search after submit
        }
    }, [])

    // User menu handler
    const handleUserMenuClick = useCallback(() => {
        // TODO: Implement user dropdown menu
        console.log('User menu clicked')
    }, [])

    // Mobile search toggle
    const toggleMobileSearch = useCallback(() => {
        setMobileSearchOpen(prev => !prev)
    }, [])

    // Profile dropdown handlers
    const toggleProfileDropdown = useCallback(() => {
        setProfileDropdownOpen(prev => !prev)
    }, [])

    const closeProfileDropdown = useCallback(() => {
        setProfileDropdownOpen(false)
    }, [])

    return (
        <header
            className="sticky top-0 border-b backdrop-blur-sm"
            style={{
                backgroundColor: HEADER_TOKENS.background.main,
                borderColor: HEADER_TOKENS.border.default,
                zIndex: HEADER_TOKENS.zIndex
            }}
        >
            {/* Main Header Row */}
            <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
                {/* Left Section: Mobile Menu + Title */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
                    <MobileMenuButton onClick={() => setSidebarOpen(true)} />
                    
                    <DSHeading
                        level={1}
                        variant="subhero"
                        className="truncate whitespace-nowrap text-base sm:text-lg lg:text-xl"
                        style={{
                            color: HEADER_TOKENS.text.primary,
                            fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
                            fontFamily: DESIGN_TOKENS.typography.fontFamily.title
                        }}
                    >
                        {pageTitle}
                    </DSHeading>
                </div>

                {/* Center Section: Desktop Search Bar */}
                <div className="hidden lg:flex flex-1 justify-center max-w-lg mx-6">
                    <SearchBar
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        onSearchSubmit={handleSearchSubmit}
                    />
                </div>
                
                {/* Right Section: Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Mobile Search Toggle */}
                    <button
                        onClick={toggleMobileSearch}
                        className="lg:hidden flex items-center justify-center p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                            color: mobileSearchOpen ? HEADER_TOKENS.brand.primary : HEADER_TOKENS.text.secondary,
                            backgroundColor: mobileSearchOpen ? `${HEADER_TOKENS.brand.primary}1A` : 'transparent',
                            transitionDuration: HEADER_TOKENS.animation.duration,
                            focusRingColor: HEADER_TOKENS.border.focus
                        }}
                        aria-label="Toggle search"
                        aria-expanded={mobileSearchOpen}
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    <NotificationBell notificationCount={3} />
                    
                    {/* Profile Dropdown */}
                    <ProfileDropdown
                        userName="Admin"
                        userEmail="admin@spyke-ai.com"
                        isOpen={profileDropdownOpen}
                        onToggle={toggleProfileDropdown}
                        onClose={closeProfileDropdown}
                    />
                </div>
            </div>

            {/* Mobile Search Row */}
            <div 
                className={`lg:hidden border-t transition-all duration-300 overflow-hidden ${
                    mobileSearchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                }`}
                style={{
                    borderColor: HEADER_TOKENS.border.default,
                    backgroundColor: HEADER_TOKENS.background.elevated
                }}
            >
                <div className="p-3 sm:p-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(searchQuery); }} className="relative">
                        <Search 
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                            style={{ color: HEADER_TOKENS.text.muted }}
                        />
                        <input
                            type="search"
                            placeholder="Search admin panel..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
                            style={{
                                backgroundColor: DESIGN_TOKENS.colors.background.dark,
                                borderColor: HEADER_TOKENS.border.default,
                                color: HEADER_TOKENS.text.primary,
                                focusRingColor: HEADER_TOKENS.border.focus
                            }}
                            aria-label="Search admin panel"
                            autoComplete="off"
                            autoFocus={mobileSearchOpen}
                        />
                    </form>
                </div>
            </div>
        </header>
    )
}

export default memo(AdminHeader)

