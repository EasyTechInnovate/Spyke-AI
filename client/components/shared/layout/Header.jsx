'use client'

import { X, Menu, TrendingUp } from 'lucide-react'
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
import { usePathname } from 'next/navigation'

export default function Header() {
    const pathname = usePathname()
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
    const isSignInPage = pathname === '/signin'

    return (
        <>
            <header
                className="fixed top-0 left-0 right-0 w-full z-[99999] bg-black/95 backdrop-blur-lg border-b border-white/10 transition-all duration-300"
                style={{
                    position: 'fixed !important',
                    top: '0px !important',
                    left: '0px !important',
                    right: '0px !important',
                    zIndex: '99999 !important',
                    width: '100% !important',
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden'
                }}>
                <Container>
                    <div className="flex items-center justify-between h-20 sm:h-24 lg:h-28">
                        <div className="flex-shrink-0">
                            <HeaderLogo />
                        </div>

                        <div className="hidden md:flex flex-1 justify-center">
                            <Navigation
                                showBecomeSeller={showBecomeSeller}
                                searchOpen={searchOpen}
                            />
                        </div>

                        {/* Right side controls positioned at far right */}
                        <div className="flex items-center space-x-3">
                            {/* Desktop only controls */}
                            <div className="hidden lg:flex items-center space-x-4">
                                <SearchButton onClick={() => setSearchOpen(true)} />
                                <CartButton count={cartCount} />
                                {user && <SimpleNotificationBell />}
                                
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
                                    !isSignInPage && (
                                        <Link
                                            href="/signin"
                                            className="relative group inline-flex overflow-hidden rounded-xl ml-4"
                                            onClick={() => {
                                                if (typeof window !== 'undefined') {
                                                    localStorage.removeItem('authToken')
                                                    localStorage.removeItem('user')
                                                    localStorage.removeItem('roles')
                                                    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                                                    document.cookie = 'roles=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                                                }
                                            }}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-green-400 to-brand-primary bg-[length:200%_100%] animate-gradient-x rounded-xl opacity-100 blur-sm transition-all duration-300 group-hover:blur-md" />
                                            <span className="relative flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-black/90 backdrop-blur-sm rounded-xl text-brand-primary font-kumbh-sans font-semibold text-sm sm:text-lg transition-all duration-300 hover:text-white hover:bg-black/80 border border-brand-primary/20 hover:border-brand-primary/40">
                                                Sign In
                                            </span>
                                        </Link>
                                    )
                                )}
                            </div>

                            {/* Mobile controls - bigger and more spacious */}
                            <div className="flex lg:hidden items-center space-x-4">
                                <SearchButton onClick={() => setSearchOpen(true)} />
                                <CartButton count={cartCount} />
                                <button
                                    className="md:hidden p-3 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200"
                                    onClick={() => {
                                        setMobileMenuOpen(!mobileMenuOpen)
                                    }}
                                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
                                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </Container>
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
            <SearchOverlay
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </>
    )
}

