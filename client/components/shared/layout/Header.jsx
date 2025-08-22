'use client'
export const dynamic = 'force-dynamic'

import { X, Menu } from 'lucide-react'
import { useHeader } from '@/hooks/useHeader'
import HeaderLogo from './Header/Logo'
import Navigation from './Header/Navigation'
import SearchButton from './Header/SearchButton'
import CartButton from './Header/CartButton'
import SimpleNotificationBell from '../notifications/SimpleNotificationBell'
import UserDropdown from './Header/UserDropdown'
import MobileMenu from './Header/MobileMenu'
import SearchOverlay from './Header/SearchOverlay'
import Link from 'next/link'
import Container from './Container'
import { NAVIGATION, SELLER_MENU_ITEMS, USER_MENU_ITEMS } from './Header/const'

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
                        {/* Logo - Always visible */}
                        <div className="flex-shrink-0">
                            <HeaderLogo />
                        </div>

                        {/* Desktop Navigation - Hidden on mobile */}
                        <div className="hidden md:flex flex-1 justify-center">
                            <Navigation
                                showBecomeSeller={showBecomeSeller}
                                searchOpen={searchOpen}
                            />
                        </div>

                        {/* Actions - Responsive layout */}
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            {/* Search Button - Hidden on small mobile, visible on sm+ */}
                            <div className="hidden sm:block">
                                <SearchButton onClick={() => setSearchOpen(true)} />
                            </div>

                            {/* Cart - Always visible but smaller on mobile */}
                            <CartButton count={cartCount} />

                            {/* User actions - Desktop only */}
                            {user && (
                                <div className="hidden md:block">
                                    <SimpleNotificationBell />
                                </div>
                            )}

                            {user ? (
                                /* User dropdown - Desktop only */
                                <div className="hidden md:block">
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
                                </div>
                            ) : (
                                /* Sign in - Desktop only */
                                <div className="hidden md:flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                                    <Link
                                        href="/signin"
                                        className="relative group inline-flex overflow-hidden rounded-xl"
                                        style={{ zIndex: 10 }}
                                        onClick={() => {
                                            // Clear any stale auth data
                                            if (typeof window !== 'undefined') {
                                                localStorage.removeItem('authToken')
                                                localStorage.removeItem('user')
                                                localStorage.removeItem('roles')
                                                // Clear cookies too
                                                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                                                document.cookie = 'roles=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                                            }
                                        }}>
                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-green-400 to-brand-primary bg-[length:200%_100%] animate-gradient-x rounded-xl opacity-100 blur-sm transition-all duration-300 group-hover:blur-md" />
                                        <span className="relative flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-black/90 backdrop-blur-sm rounded-xl text-brand-primary font-kumbh-sans font-semibold text-sm sm:text-lg transition-all duration-300 hover:text-white hover:bg-black/80 border border-brand-primary/20 hover:border-brand-primary/40">
                                            Sign In
                                        </span>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Toggle - Mobile only */}
                            <button
                                className="md:hidden p-2 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200"
                                onClick={() => {
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }}
                                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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

