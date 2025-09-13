import Link from 'next/link'
import { X, Menu, TrendingUp, ShoppingCart, LogOut, Store, User } from 'lucide-react'
import UserAvatar, { getDisplayName, getInitials } from './UserAvatar'

export default function MobileMenu({
    isOpen,
    onClose,
    user,
    cartCount,
    currentRole,
    isSeller,
    navigation,
    menuItems,
    showBecomeSeller,
    onSwitchRole,
    onLogout
}) {
    if (!isOpen) return null

    return (
        <>
            {/* Mobile Menu Overlay */}
            <div 
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />
            
            {/* Mobile Menu Content - Fixed positioning to align with header */}
            <div className="md:hidden fixed top-20 sm:top-24 lg:top-28 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-gray-700 max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] lg:max-h-[calc(100vh-7rem)] overflow-y-auto z-50">
                <nav className="flex flex-col py-4">
                    {showBecomeSeller && (
                        <Link
                            href="/become-seller"
                            className="flex items-center gap-3 font-kumbh-sans font-medium text-base text-[#00FF89] hover:text-[#00e67a] px-6 py-4 hover:bg-[#00FF89]/10 transition-all border-b-2 border-[#00FF89]/20 bg-gradient-to-r from-[#00FF89]/5 to-transparent"
                            onClick={onClose}>
                            <TrendingUp className="h-5 w-5" />
                            <span>Become a Seller</span>
                        </Link>
                    )}

                    {/* Navigation Links */}
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary px-6 py-4 hover:bg-white/5 transition-all border-b border-gray-800/50"
                            onClick={onClose}>
                            {item.icon && <item.icon className="h-5 w-5 opacity-70" />}
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    {user ? (
                        <>
                            <div className="border-t border-gray-700 mt-2">
                                {/* User Info */}
                                <div className="flex items-center gap-3 px-6 py-4 bg-gray-900/50">
                                    <UserAvatar
                                        user={user}
                                        size="lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-medium text-white truncate">
                                            {getDisplayName(user.name, user.emailAddress || user.email)}
                                        </p>
                                        <p className="text-sm text-gray-400 truncate">{user.emailAddress || user.email}</p>
                                    </div>
                                </div>

                                {/* Role Switcher */}
                                {isSeller && (
                                    <div className="px-6 py-4 bg-gray-900/30">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Switch Mode</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    onSwitchRole('user')
                                                    onClose()
                                                }}
                                                className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-lg transition-all ${
                                                    currentRole === 'user' ? 'bg-brand-primary text-black font-medium' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                                                }`}>
                                                <User className="w-5 h-5" />
                                                <span className="text-sm font-medium">Buyer</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onSwitchRole('seller')
                                                    onClose()
                                                }}
                                                className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-lg transition-all ${
                                                    currentRole === 'seller' ? 'bg-brand-primary text-black font-medium' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                                                }`}>
                                                <Store className="w-5 h-5" />
                                                <span className="text-sm font-medium">Seller</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Cart Link */}
                                <Link
                                    href="/cart"
                                    className="flex items-center gap-3 font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary px-6 py-4 hover:bg-white/5 transition-all border-b border-gray-800/50"
                                    onClick={onClose}>
                                    <ShoppingCart className="h-5 w-5 opacity-70" />
                                    <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                                </Link>

                                {/* Menu Items */}
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-3 font-kumbh-sans font-medium text-base text-gray-300 hover:text-brand-primary px-6 py-4 hover:bg-white/5 transition-all border-b border-gray-800/50"
                                        onClick={onClose}>
                                        <item.icon className="h-5 w-5 opacity-70" />
                                        <span>{item.name}</span>
                                    </Link>
                                ))}

                                {/* Logout Button */}
                                <div className="px-6 py-4">
                                    <button
                                        onClick={() => {
                                            onLogout()
                                            onClose()
                                        }}
                                        className="w-full flex items-center justify-center gap-2 font-kumbh-sans font-medium text-base text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg py-3 transition-all">
                                        <LogOut className="h-5 w-5" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="border-t border-gray-700 pt-4 mt-2 px-6 pb-6 space-y-4">
                            <Link
                                href="/signin"
                                className="block w-full text-center font-kumbh-sans font-medium text-base bg-brand-primary text-black hover:bg-brand-primary/90 py-3 rounded-lg transition-colors"
                                onClick={onClose}>
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="block w-full text-center font-kumbh-sans font-medium text-base text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 py-3 rounded-lg transition-colors"
                                onClick={onClose}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </>
    )
}
