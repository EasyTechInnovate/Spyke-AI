import { BarChart3, Briefcase, DollarSign, Heart, MessageSquare, Package, Settings, User, Users, Search, UserCheck, Grid3X3, HelpCircle } from "lucide-react"

export const NAVIGATION = [
    { name: 'Explore', href: '/explore', prefetch: false, icon: Search },
    { name: 'Sellers', href: '/creators', prefetch: false, icon: UserCheck },
    { name: 'Categories', href: '/categories', prefetch: false, icon: Grid3X3 },
    { name: 'Hire Us', href: '/hire', prefetch: false, icon: Users }
]

export const USER_MENU_ITEMS = [
    { name: 'My Purchases', href: '/purchases', icon: Package, prefetch: false },
    { name: 'Profile', href: '/account/profile', icon: User, prefetch: false },
    { name: 'Settings', href: '/settings', icon: Settings, prefetch: false }
]

export const SELLER_MENU_ITEMS = [
    { name: 'Dashboard', href: '/dashboard', icon: Briefcase },
    { name: 'My Products', href: '/seller/products', icon: Package, prefetch: false },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart3, prefetch: false },
    { name: 'Earnings', href: '/seller/earnings', icon: DollarSign, prefetch: false },
    { name: 'Profile', href: '/seller/profile', icon: User, prefetch: false },
    { name: 'Settings', href: '/seller/settings', icon: Settings, prefetch: false }
]