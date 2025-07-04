'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, Search, ShoppingCart, Users, TrendingUp, User, Package, Settings, LogOut, ChevronDown, Store, Briefcase } from 'lucide-react'
import Container from './Container'
import { SpykeLogo } from '@/components/Logo'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function Header() {
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    const [currentRole, setCurrentRole] = useState('user')
    const dropdownRef = useRef(null)

    const navigation = [
        { name: 'Explore', href: '/explore' },
        { name: 'Categories', href: '/categories' },
        { name: 'Top Creators', href: '/creators' },
        { name: 'Hire', href: '/hire', icon: Users }
    ]

    const userMenuItems = [
        { name: 'My Purchases', href: '/account/purchases', icon: Package },
        { name: 'Profile', href: '/account/profile', icon: User },
        { name: 'Settings', href: '/account/settings', icon: Settings }
    ]

    const sellerMenuItems = [
        { name: 'Dashboard', href: '/seller/dashboard', icon: Briefcase },
        { name: 'My Products', href: '/seller/products', icon: Package },
        { name: 'Analytics', href: '/seller/analytics', icon: TrendingUp },
        { name: 'Settings', href: '/seller/settings', icon: Settings }
    ]

    useEffect(() => {
        const loadUserFromStorage = () => {
            const token = localStorage.getItem('authToken')
            const userStr = localStorage.getItem('user')
            if (token && userStr) {
                try {
                    const parsed = JSON.parse(userStr)
                    setUser(parsed)
                    fetchCartCount()
                    if (pathname?.startsWith('/seller')) {
                        setCurrentRole('seller')
                    } else {
                        setCurrentRole('user')
                    }
                } catch {
                    console.error('Failed to parse user data')
                    localStorage.removeItem('user')
                    setUser(null)
                }
            } else {
                setUser(null)
                setCartCount(0)
            }
        }

        loadUserFromStorage()
        window.addEventListener('storage', loadUserFromStorage)
        return () => window.removeEventListener('storage', loadUserFromStorage)
    }, [pathname])

    const fetchCartCount = async () => {
        try {
            // replace with: const count = await api.cart.getCount()
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

    const handleLogout = async () => {
        try {
            await api.auth.logout()
        } catch (err) {
            console.error('Logout failed:', err)
        } finally {
            localStorage.removeItem('authToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            setUser(null)
            setCartCount(0)
            setDropdownOpen(false)
            window.dispatchEvent(new Event('storage'))
            toast.success('Logged out successfully')
            router.push('/')
        }
    }

    const getInitials = (name, email) => {
        if (!name) return email?.slice(0, 2).toUpperCase() || 'U'
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
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

    const isSeller = user?.roles?.includes('seller')
    const showBecomeSeller = !isSeller && currentRole === 'user'

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-black/95 backdrop-blur-lg shadow-2xl shadow-brand-primary/10 border-b border-brand-primary/20'
                    : 'bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm border-b border-white/5'
            }`}>
            <Container>
                <div className="flex items-center justify-between h-20">
                    <Link
                        href="/"
                        className="flex items-center">
                        <SpykeLogo
                            size={45}
                            showText={false}
                            textSize="text-2xl"
                            className="[&_span]:!text-white [&_div]:!text-gray-400"
                        />
                    </Link>

                    <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="group flex items-center gap-2 font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary transition-all duration-300">
                                {item.icon && <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                        {showBecomeSeller && (
                            <Link
                                href="/become-seller"
                                className="group flex items-center gap-2 font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary transition-all duration-300">
                                <TrendingUp className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                                <span>Become a seller</span>
                            </Link>
                        )}
                    </nav>

                    <div className="hidden md:flex items-center space-x-4">
                        <button className="p-2.5 text-gray-300 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300">
                            <Search className="h-5 w-5" />
                        </button>

                        {user && (
                            <Link
                                href="/cart"
                                className="relative p-2.5 text-gray-300 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300">
                                <ShoppingCart className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-black text-xs font-bold rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div
                                className="relative"
                                ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-brand-primary/10 transition-all duration-300">
                                    {/* Role Indicator */}
                                    {isSeller && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-primary/20 rounded-md">
                                            {currentRole === 'seller' ? (
                                                <Store className="w-3.5 h-3.5 text-brand-primary" />
                                            ) : (
                                                <User className="w-3.5 h-3.5 text-brand-primary" />
                                            )}
                                            <span className="text-xs font-medium text-brand-primary">
                                                {currentRole === 'seller' ? 'Seller' : 'Buyer'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-black font-semibold text-sm">{getInitials(user.name, user.emailAddress)}</span>
                                        )}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-800">
                                            <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.emailAddress || user.email}</p>
                                        </div>

                                        {/* Role Switcher Section */}
                                        {isSeller && (
                                            <>
                                                <div className="p-2 border-b border-gray-800">
                                                    <div className="grid grid-cols-2 gap-1 p-1 bg-gray-800/50 rounded-lg">
                                                        <button
                                                            onClick={() => switchRole('user')}
                                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-all ${
                                                                currentRole === 'user'
                                                                    ? 'bg-brand-primary text-black font-medium'
                                                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                                            }`}>
                                                            <User className="w-4 h-4" />
                                                            <span className="text-sm">Buyer</span>
                                                        </button>
                                                        <button
                                                            onClick={() => switchRole('seller')}
                                                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-all ${
                                                                currentRole === 'seller'
                                                                    ? 'bg-brand-primary text-black font-medium'
                                                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                                            }`}>
                                                            <Store className="w-4 h-4" />
                                                            <span className="text-sm">Seller</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="py-2">
                                                    {(currentRole === 'seller' ? sellerMenuItems : userMenuItems).map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                                                            onClick={() => setDropdownOpen(false)}>
                                                            <item.icon className="h-4 w-4" />
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Regular User Menu */}
                                        {!isSeller && (
                                            <>
                                                <div className="py-2">
                                                    {userMenuItems.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                                                            onClick={() => setDropdownOpen(false)}>
                                                            <item.icon className="h-4 w-4" />
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>

                                                <div className="border-t border-gray-800 py-2">
                                                    <Link
                                                        href="/seller/profile"
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-brand-primary hover:bg-gray-800 transition-colors"
                                                        onClick={() => setDropdownOpen(false)}>
                                                        <Store className="h-4 w-4" />
                                                        <span className="font-medium">Your seller account</span>
                                                    </Link>
                                                </div>
                                            </>
                                        )}

                                        <div className="border-t border-gray-800 py-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                                                <LogOut className="h-4 w-4" />
                                                <span>Log out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Sign In / Get Started */
                            <>
                                <Link
                                    href="/signin"
                                    className="px-5 py-2.5 font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary transition-all duration-300">
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl opacity-75 blur transition duration-300 group-hover:opacity-100" />
                                    <span className="relative flex items-center px-6 py-3 bg-black rounded-xl text-brand-primary font-kumbh-sans font-semibold text-base transition-all duration-300">
                                        Get Started
                                    </span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-300"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-800">
                        <nav className="flex flex-col space-y-4">
                            {/* Search Bar for Mobile */}
                            <div className="px-2 pb-4">
                                <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-lg text-gray-300">
                                    <Search className="h-5 w-5" />
                                    <span>Search</span>
                                </button>
                            </div>

                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-2 font-kumbh-sans font-medium text-base text-gray-300 px-2"
                                    onClick={() => setMobileMenuOpen(false)}>
                                    {item.icon && <item.icon className="h-4 w-4 opacity-70" />}
                                    <span>{item.name}</span>
                                </Link>
                            ))}

                            {showBecomeSeller && (
                                <Link
                                    href="/become-seller"
                                    className="flex items-center gap-2 font-kumbh-sans font-medium text-base text-gray-300 px-2"
                                    onClick={() => setMobileMenuOpen(false)}>
                                    <TrendingUp className="h-4 w-4 opacity-70" />
                                    <span>Become a Seller</span>
                                </Link>
                            )}

                            {user ? (
                                <>
                                    <div className="border-t border-gray-800 pt-4 mt-4">
                                        {/* User Info */}
                                        <div className="flex items-center gap-3 px-2 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-black font-semibold">
                                                        {getInitials(user.name, user.emailAddress || user.email)}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{user.name || 'User'}</p>
                                                <p className="text-xs text-gray-400">{user.emailAddress || user.email}</p>
                                            </div>
                                        </div>

                                        {/* Role Switcher for Mobile */}
                                        {isSeller && (
                                            <div className="px-2 mb-4">
                                                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-800/50 rounded-lg">
                                                    <button
                                                        onClick={() => {
                                                            switchRole('user')
                                                            setMobileMenuOpen(false)
                                                        }}
                                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-all ${
                                                            currentRole === 'user'
                                                                ? 'bg-brand-primary text-black font-medium'
                                                                : 'text-gray-400 hover:text-white'
                                                        }`}>
                                                        <User className="w-4 h-4" />
                                                        <span className="text-sm">Buyer</span>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            switchRole('seller')
                                                            setMobileMenuOpen(false)
                                                        }}
                                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md transition-all ${
                                                            currentRole === 'seller'
                                                                ? 'bg-brand-primary text-black font-medium'
                                                                : 'text-gray-400 hover:text-white'
                                                        }`}>
                                                        <Store className="w-4 h-4" />
                                                        <span className="text-sm">Seller</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cart Link - Mobile */}
                                        <Link
                                            href="/cart"
                                            className="flex items-center gap-2 font-kumbh-sans font-medium text-base text-gray-300 px-2 mb-4"
                                            onClick={() => setMobileMenuOpen(false)}>
                                            <ShoppingCart className="h-4 w-4 opacity-70" />
                                            <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                                        </Link>

                                        {/* User/Seller Menu Items */}
                                        {(currentRole === 'seller' && isSeller ? sellerMenuItems : userMenuItems).map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="flex items-center gap-2 font-kumbh-sans font-medium text-base text-gray-300 px-2 mb-4"
                                                onClick={() => setMobileMenuOpen(false)}>
                                                <item.icon className="h-4 w-4 opacity-70" />
                                                <span>{item.name}</span>
                                            </Link>
                                        ))}

                                        {!isSeller && (
                                            <Link
                                                href="/become-seller"
                                                className="flex items-center gap-2 font-kumbh-sans font-medium text-base text-brand-primary px-2 mb-4"
                                                onClick={() => setMobileMenuOpen(false)}>
                                                <Store className="h-4 w-4" />
                                                <span>Become a Seller</span>
                                            </Link>
                                        )}

                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                setMobileMenuOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 font-kumbh-sans font-medium text-base text-gray-300 px-2">
                                            <LogOut className="h-4 w-4 opacity-70" />
                                            <span>Log out</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="border-t border-gray-800 pt-4 mt-4 px-2 space-y-4">
                                        <Link
                                            href="/signin"
                                            className="block font-kumbh-sans font-medium text-base text-gray-300"
                                            onClick={() => setMobileMenuOpen(false)}>
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="block w-full px-6 py-3 bg-brand-primary text-brand-dark font-kumbh-sans font-semibold text-base rounded-xl text-center"
                                            onClick={() => setMobileMenuOpen(false)}>
                                            Get Started
                                        </Link>
                                    </div>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </Container>
        </header>
    )
}
