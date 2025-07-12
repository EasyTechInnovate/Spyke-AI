'use client'
export const dynamic = 'force-dynamic'

import { Users, Package, Heart, MessageSquare, User, Settings, Briefcase, BarChart3, DollarSign, X, Menu } from 'lucide-react'
import Container from '../Container'
import { useHeader } from '@/hooks/useHeader'
import HeaderLogo from './Logo'
import Navigation from './Navigation'
import SearchButton from './SearchButton'
import NotificationBell from './NotificationBell'
import CartButton from './CartButton'
import UserDropdown from './UserDropdown'
import MobileMenu from './MobileMenu'
import SearchOverlay from './SearchOverlay'
import Link from 'next/link'

const NAVIGATION = [
    { name: 'Explore', href: '/explore' },
    { name: 'Categories', href: '/categories' },
    { name: 'Top Creators', href: '/creators' },
    { name: 'Hire', href: '/hire', icon: Users }
]

const USER_MENU_ITEMS = [
    { name: 'My Purchases', href: '/account/purchases', icon: Package },
    { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { name: 'Messages', href: '/account/messages', icon: MessageSquare },
    { name: 'Profile', href: '/account/profile', icon: User },
    { name: 'Settings', href: '/account/settings', icon: Settings }
]

const SELLER_MENU_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: Briefcase },
    { name: 'My Products', href: '/seller/products', icon: Package },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
    { name: 'Earnings', href: '/seller/earnings', icon: DollarSign },
    { name: 'Messages', href: '/seller/messages', icon: MessageSquare },
    { name: 'Settings', href: '/seller/settings', icon: Settings }
]

export default function Header() {
    const {
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
        isSeller,
        showBecomeSeller
    } = useHeader()

    const menuItems = currentRole === 'seller' && isSeller ? SELLER_MENU_ITEMS : USER_MENU_ITEMS

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
                        {/* Logo */}
                        <HeaderLogo />

                        {/* Navigation */}
                        <Navigation
                            showBecomeSeller={showBecomeSeller}
                            searchOpen={searchOpen}
                        />

                        {/* Actions */}
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                            {/* Search Button */}
                            <SearchButton onClick={() => setSearchOpen(true)} />

                            {user && (
                                <>
                                    {/* Notifications */}
                                    <NotificationBell count={notifications} />

                                    {/* Cart */}
                                    <CartButton count={cartCount} />
                                </>
                            )}

                            {/* User Menu / Sign In */}
                            {user ? (
                                <UserDropdown
                                    ref={dropdownRef}
                                    user={user}
                                    currentRole={currentRole}
                                    isSeller={isSeller}
                                    dropdownOpen={dropdownOpen}
                                    setDropdownOpen={setDropdownOpen}
                                    onLogout={handleLogout}
                                    onSwitchRole={switchRole}
                                />
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

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden p-2 sm:p-2.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                            </button>
                        </div>
                    </div>
                </Container>

                {/* Mobile Menu */}
                <MobileMenu
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                    user={user}
                    cartCount={cartCount}
                    currentRole={currentRole}
                    isSeller={isSeller}
                    navigation={NAVIGATION}
                    menuItems={menuItems}
                    showBecomeSeller={showBecomeSeller}
                    onSwitchRole={switchRole}
                    onLogout={handleLogout}
                />
            </header>

            {/* Search Overlay */}
            <SearchOverlay
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </>
    )
}
