import { BarChart3, Briefcase, DollarSign, Heart, MessageSquare, Package, Settings, User, Users } from "lucide-react"

export const NAVIGATION = [
    { name: 'Explore', href: '/explore', prefetch: false },
    { name: 'Categories', href: '/categories', prefetch: false },
    { name: 'Top Creators', href: '/creators', prefetch: false },
    { name: 'Hire', href: '/hire', prefetch: false, icon: Users }
]

export const USER_MENU_ITEMS = [
    { name: 'My Purchases', href: '/account/purchases', icon: Package, prefetch: false },
    { name: 'Wishlist', href: '/account/wishlist', icon: Heart, prefetch: false },
    { name: 'Messages', href: '/account/messages', icon: MessageSquare, prefetch: false },
    { name: 'Profile', href: '/account/profile', icon: User, prefetch: false },
    { name: 'Settings', href: '/account/settings', icon: Settings, prefetch: false }
]

export const SELLER_MENU_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: Briefcase },
    { name: 'My Products', href: '/seller/products', icon: Package, prefetch: false },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart3, prefetch: false },
    { name: 'Earnings', href: '/seller/earnings', icon: DollarSign, prefetch: false },
    { name: 'Messages', href: '/seller/messages', icon: MessageSquare, prefetch: false },
    { name: 'Profile', href: '/seller/profile', icon: User, prefetch: false },
    { name: 'Settings', href: '/seller/settings', icon: Settings, prefetch: false }
]