import { BarChart3, Briefcase, DollarSign, Heart, MessageSquare, Package, Settings, User, Users } from "lucide-react"

export const NAVIGATION = [
    { name: 'Explore', href: '/explore', prefetch: false },
    { name: 'Categories', href: '/categories', prefetch: false },
    { name: 'Top Creators', href: '/creators', prefetch: false },
    { name: 'Hire', href: '/hire', prefetch: false, icon: Users }
]

export const USER_MENU_ITEMS = [
    { name: 'My Purchases', href: '/account/purchases', icon: Package },
    { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { name: 'Messages', href: '/account/messages', icon: MessageSquare },
    { name: 'Profile', href: '/account/profile', icon: User },
    { name: 'Settings', href: '/account/settings', icon: Settings }
]

export const SELLER_MENU_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: Briefcase },
    { name: 'My Products', href: '/seller/products', icon: Package },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
    { name: 'Earnings', href: '/seller/earnings', icon: DollarSign },
    { name: 'Messages', href: '/seller/messages', icon: MessageSquare },
    { name: 'Settings', href: '/seller/settings', icon: Settings }
]