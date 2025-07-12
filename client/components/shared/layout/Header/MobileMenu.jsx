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
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-gray-700 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col py-4">
                {/* Navigation Links */}
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-gray-300 hover:text-brand-primary px-4 py-3 hover:bg-white/5 transition-all"
                        onClick={onClose}
                    >
                        {item.icon && <item.icon className="h-5 w-5 opacity-70" />}
                        <span>{item.name}</span>
                    </Link>
                ))}
                
                {showBecomeSeller && (
                    <Link
                        href="/become-seller"
                        className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-brand-primary px-4 py-3 hover:bg-white/5 transition-all"
                        onClick={onClose}
                    >
                        <TrendingUp className="h-5 w-5 opacity-70" />
                        <span>Become a seller</span>
                    </Link>
                )}

                {user ? (
                    <>
                        <div className="border-t border-gray-700 mt-4">
                            {/* User Info */}
                            <div className="flex items-center gap-3 px-4 py-4">
                                <UserAvatar user={user} size="lg" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm sm:text-base font-medium text-white truncate">
                                        {getDisplayName(user.name, user.emailAddress || user.email)}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-400 truncate">
                                        {user.emailAddress || user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Role Switcher */}
                            {isSeller && (
                                <div className="px-4 pb-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Switch Account</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                onSwitchRole('user')
                                                onClose()
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 px-3 py-3 sm:py-4 rounded-lg transition-all ${
                                                currentRole === 'user'
                                                    ? 'bg-brand-primary text-black font-medium'
                                                    : 'bg-gray-800/50 text-gray-300'
                                            }`}
                                        >
                                            <User className="w-5 h-5" />
                                            <span className="text-xs sm:text-sm font-medium">Buyer</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                onSwitchRole('seller')
                                                onClose()
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1 px-3 py-3 sm:py-4 rounded-lg transition-all ${
                                                currentRole === 'seller'
                                                    ? 'bg-brand-primary text-black font-medium'
                                                    : 'bg-gray-800/50 text-gray-300'
                                            }`}
                                        >
                                            <Store className="w-5 h-5" />
                                            <span className="text-xs sm:text-sm font-medium">Seller</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Cart Link */}
                            <Link
                                href="/cart"
                                className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-gray-300 px-4 py-3 hover:bg-white/5 transition-all"
                                onClick={onClose}
                            >
                                <ShoppingCart className="h-5 w-5 opacity-70" />
                                <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                            </Link>

                            {/* Menu Items */}
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-gray-300 px-4 py-3 hover:bg-white/5 transition-all"
                                    onClick={onClose}
                                >
                                    <item.icon className="h-5 w-5 opacity-70" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}

                            {!isSeller && (
                                <Link
                                    href="/become-seller"
                                    className="flex items-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-brand-primary px-4 py-3 hover:bg-white/5 transition-all"
                                    onClick={onClose}
                                >
                                    <Store className="h-5 w-5" />
                                    <span>Become a Seller</span>
                                </Link>
                            )}

                            {/* Logout Button */}
                            <div className="mt-4 px-4 pb-4 border-t border-gray-700 pt-4">
                                <button
                                    onClick={() => {
                                        onLogout()
                                        onClose()
                                    }}
                                    className="w-full flex items-center justify-center gap-2 font-kumbh-sans font-medium text-base sm:text-lg text-red-400 bg-red-500/10 rounded-lg py-3 hover:bg-red-500/20 transition-all"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="border-t border-gray-700 pt-4 mt-4 px-4 pb-4 space-y-3 sm:space-y-4">
                        <Link
                            href="/signin"
                            className="block font-kumbh-sans font-medium text-base sm:text-lg text-gray-300 hover:text-brand-primary py-2 transition-colors"
                            onClick={onClose}
                        >
                            Sign In
                        </Link>
                    </div>
                )}
            </nav>
        </div>
    )
}