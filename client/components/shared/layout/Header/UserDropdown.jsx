import { useState, forwardRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ChevronDown, ChevronRight, LogOut, Package, Heart, 
    MessageSquare, User, Settings, Briefcase, BarChart3, 
    DollarSign, Store 
} from 'lucide-react'
import UserAvatar, { getDisplayName } from './UserAvatar'
import RoleSwitcher from './RoleSwitcher'
import { useTrackEvent, useTrackClick } from '@/hooks/useTrackEvent'
import { ANALYTICS_EVENTS, eventProperties } from '@/lib/analytics/events'
import { SELLER_MENU_ITEMS, USER_MENU_ITEMS } from './const'


const UserDropdown = forwardRef(({ 
    user, 
    currentRole, 
    isSeller, 
    dropdownOpen, 
    setDropdownOpen,
    onLogout,
    onSwitchRole
}, ref) => {
    const track = useTrackEvent()
    const trackLogoutClick = useTrackClick(ANALYTICS_EVENTS.AUTH.LOGOUT_CLICKED)
    const menuItems = currentRole === 'seller' && isSeller ? SELLER_MENU_ITEMS : USER_MENU_ITEMS

    return (
        <div className="relative hidden md:block" ref={ref}>
            <button
                onClick={() => {
                    setDropdownOpen(!dropdownOpen)
                    if (!dropdownOpen) {
                        track(ANALYTICS_EVENTS.NAVIGATION.USER_DROPDOWN_OPENED, {
                            role: currentRole,
                            isSeller
                        })
                    }
                }}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/5 hover:bg-brand-primary/10 transition-all duration-300"
            >
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

                <UserAvatar user={user} />
                
                <ChevronDown
                    className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {dropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900/98 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* User Info Section */}
                        <div className="px-5 py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-b border-gray-700">
                            <div className="flex items-start gap-3">
                                <UserAvatar user={user} size="lg" />
                                <div className="flex-1">
                                    <p className="text-base font-medium text-white">
                                        {getDisplayName(user.name, user.emailAddress || user.email)}
                                    </p>
                                    <p className="text-sm text-gray-400 truncate">
                                        {user.emailAddress || user.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Role Switcher */}
                        {isSeller && (
                            <div className="p-3 border-b border-gray-700">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 px-2">Switch Mode</p>
                                <RoleSwitcher 
                                    currentRole={currentRole} 
                                    onSwitch={onSwitchRole}
                                />
                            </div>
                        )}

                        {/* Menu Items */}
                        <div className="py-2 max-h-[300px] overflow-y-auto">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center justify-between px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                                    onClick={() => {
                                        track(ANALYTICS_EVENTS.NAVIGATION.USER_MENU_ITEM_CLICKED, 
                                            eventProperties.navigation(item.name, currentRole === 'seller' ? 'seller_menu' : 'user_menu')
                                        )
                                        setDropdownOpen(false)
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-700/50 transition-colors">
                                            <item.icon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                                        </div>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>

                        {/* Bottom Actions */}
                        <div className="border-t border-gray-700">
                            {!isSeller && (
                                <Link
                                    href="/become-seller"
                                    className="flex items-center justify-between px-5 py-3 text-sm hover:bg-gray-800/50 transition-colors group"
                                    onClick={() => {
                                        track(ANALYTICS_EVENTS.SELLER.BECOME_SELLER_CLICKED, {
                                            source: 'user_dropdown'
                                        })
                                        setDropdownOpen(false)
                                    }}
                                >
                                    <div className="flex items-center gap-3 text-brand-primary">
                                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                                            <Store className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">Become a Seller</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary" />
                                </Link>
                            )}

                            <button
                                onClick={(e) => {
                                    trackLogoutClick(e)
                                    onLogout()
                                }}
                                className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border-t border-gray-700 group"
                            >
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
    )
})

UserDropdown.displayName = 'UserDropdown'
export default UserDropdown