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

    const menuItems = currentRole === 'seller' && isSeller ? SELLER_MENU_ITEMS : USER_MENU_ITEMS
    const isSignInPage = pathname === '/signin'

    return (
        <>
            <div 
                className="sticky-header-wrapper"
                style={{
                    position: 'sticky !important',
                    top: '0 !important',
                    zIndex: '9999 !important',
                    width: '100% !important',
                    backgroundColor: 'rgba(0, 0, 0, 0.95) !important',
                    backdropFilter: 'blur(20px) !important',
                    WebkitBackdropFilter: 'blur(20px) !important',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1) !important',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3) !important',
                    willChange: 'transform !important',
                    transform: 'translateZ(0) !important'
                }}
            >
                <div style={{
                    maxWidth: '120rem !important',
                    margin: '0 auto !important',
                    padding: '0 2rem !important'
                }}>
                    <div style={{
                        display: 'flex !important',
                        alignItems: 'center !important',
                        justifyContent: 'space-between !important',
                        height: '80px !important',
                        width: '100% !important'
                    }}>
                        <div style={{
                            flexShrink: '0 !important'
                        }}>
                            <HeaderLogo />
                        </div>

                        <div style={{
                            flex: '1 !important',
                            display: 'flex !important',
                            justifyContent: 'center !important',
                            margin: '0 2rem !important'
                        }} className="hidden md:flex">
                            <Navigation
                                showBecomeSeller={showBecomeSeller}
                                searchOpen={searchOpen}
                            />
                        </div>

                        <div style={{
                            display: 'flex !important',
                            alignItems: 'center !important',
                            gap: '1rem !important'
                        }}>
                            <div className="hidden sm:block">
                                <SearchButton onClick={() => setSearchOpen(true)} />
                            </div>
                            <CartButton count={cartCount} />
                            {user && (
                                <div className="hidden md:block">
                                    <SimpleNotificationBell />
                                </div>
                            )}

                            {user ? (
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
                                !isSignInPage && (
                                    <Link
                                        href="/signin"
                                        style={{
                                            display: 'inline-flex !important',
                                            alignItems: 'center !important',
                                            padding: '8px 20px !important',
                                            backgroundColor: 'transparent !important',
                                            color: '#00FF89 !important',
                                            fontWeight: '600 !important',
                                            borderRadius: '12px !important',
                                            textDecoration: 'none !important',
                                            fontSize: '16px !important',
                                            border: '1px solid rgba(255, 255, 255, 0.2) !important',
                                            transition: 'all 0.3s ease !important'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.color = '#00FF89'
                                            e.target.style.borderColor = 'rgba(0, 255, 137, 0.4)'
                                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.color = '#00FF89'
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                                            e.target.style.backgroundColor = 'transparent'
                                        }}
                                        onClick={() => {
                                            if (typeof window !== 'undefined') {
                                                localStorage.removeItem('authToken')
                                                localStorage.removeItem('user')
                                                localStorage.removeItem('roles')
                                                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                                                document.cookie = 'roles=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                                            }
                                        }}>
                                        Sign In
                                    </Link>
                                )
                            )}
                            
                            <button
                                className="md:hidden"
                                style={{
                                    padding: '8px !important',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
                                    borderRadius: '8px !important',
                                    border: 'none !important',
                                    color: 'rgba(255, 255, 255, 0.7) !important'
                                }}
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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
            
            <SearchOverlay
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </>
    )
}

