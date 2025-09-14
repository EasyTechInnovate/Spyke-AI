'use client'

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
import { NAVIGATION, SELLER_MENU_ITEMS, USER_MENU_ITEMS } from './Header/const'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Header() {
    const pathname = usePathname()
    const {
        mobileMenuOpen,
        setMobileMenuOpen,
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

    // Prevent hydration flash / mismatch for user-dependent UI
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const menuItems = currentRole === 'seller' && isSeller ? SELLER_MENU_ITEMS : USER_MENU_ITEMS
    const isSignInPage = pathname === '/signin'

    return (
        <>
            <div className="sticky top-0 z-[9999] w-full backdrop-blur-xl bg-black/95 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] supports-[backdrop-filter]:bg-black/80">
                <div className="max-w-[120rem] mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between h-20 w-full">
                        {/* Logo */}
                        <div className="shrink-0">
                            <HeaderLogo />
                        </div>

                        {/* Desktop Navigation */}
                        <div className="flex-1 hidden md:flex justify-center mx-4">
                            <Navigation showBecomeSeller={showBecomeSeller} searchOpen={searchOpen} />
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:block">
                                <SearchButton onClick={() => setSearchOpen(true)} />
                            </div>
                            <CartButton count={cartCount} />
                            {mounted && user && (
                                <div className="hidden md:block">
                                    <SimpleNotificationBell />
                                </div>
                            )}

                            {/* User / Auth Buttons */}
                            {mounted && user ? (
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
                                mounted && !isSignInPage && (
                                    <Link
                                        href="/signin"
                                        className="inline-flex items-center px-5 py-2.5 rounded-xl border border-white/20 text-[#00FF89] font-semibold text-sm hover:border-[#00FF89]/40 hover:bg-white/5 transition-colors"
                                        onClick={() => {
                                            if (typeof window !== 'undefined') {
                                                localStorage.removeItem('authToken')
                                                localStorage.removeItem('user')
                                                localStorage.removeItem('roles')
                                                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                                                document.cookie = 'roles=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                                            }
                                        }}
                                    >
                                        Sign In
                                    </Link>
                                )
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden p-2.5 rounded-lg bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                user={mounted ? user : null}
                cartCount={cartCount}
                currentRole={currentRole}
                isSeller={isSeller}
                navigation={NAVIGATION}
                menuItems={menuItems}
                showBecomeSeller={showBecomeSeller}
                onSwitchRole={switchRole}
                onLogout={handleLogout}
            />

            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    )
}

