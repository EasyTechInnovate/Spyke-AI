import { LayoutDashboard, UserCheck, Package, Tag, TrendingUp, ShieldCheck, Settings, Wrench, DollarSign, Users } from 'lucide-react'

// Coming Soon Features Set
export const COMING_SOON = new Set(['compliance'])

// Navigation items factory function
export const createNavigationItems = (
    counts = { sellers: { pending: 0, active: 0, payouts: 0 }, products: { pending: 0, flagged: 0, featured: 0 } }
) => [
    {
        id: 'overview',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/admin/dashboard'
    },
    // NEW: Dedicated Payout menu (separate from Sellers>Payouts subsection)
    {
        id: 'payout',
        label: 'Payout',
        icon: DollarSign,
        href: '/admin/payout'
    },
    {
        id: 'sellers',
        label: 'Sellers',
        icon: UserCheck,
        badge: (counts?.sellers?.pending || 0) + (counts?.sellers?.active || 0) || undefined,
        subItems: [
            {
                id: 'pending-sellers',
                label: 'Pending Approval',
                href: '/admin/sellers/pending',
                badge: counts?.sellers?.pending || undefined
            },
            {
                id: 'active-sellers',
                label: 'Active Sellers',
                href: '/admin/sellers/active',
                badge: counts?.sellers?.active || undefined
            },
        ]
    },
    {
        id: 'products',
        label: 'Products',
        icon: Package,
        badge: (counts?.products?.pending || 0) + (counts?.products?.flagged || 0) + (counts?.products?.featured || 0) || undefined,
        subItems: [
            {
                id: 'pending-products',
                label: 'Pending Review',
                href: '/admin/products/pending',
                badge: counts?.products?.pending || undefined
            },
            {
                id: 'featured-products',
                label: 'Featured',
                href: '/admin/products/featured',
                badge: counts?.products?.featured || undefined
            }
        ]
    },
    {
        id: 'promocodes',
        label: 'Promocodes',
        icon: Tag,
        href: '/admin/promocodes'
    },
    {
        id: 'tools-niche',
        label: 'Tools and Niche',
        icon: Wrench,
        href: '/admin/tools-niche'
    },
    {
        id: 'analytics',
        label: 'Analytics',
        icon: TrendingUp,
        href: '/admin/analytics/platform'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        subItems: [
            {
                id: 'user-management',
                label: 'User Management',
                icon: Users,
                href: '/admin/settings/user-management'
            },
            {
                id: 'seller-management',
                label: 'Seller Management',
                icon: UserCheck,
                href: '/admin/settings/seller-management'
            },
            {
                id: 'payout-settings',
                label: 'Payout Settings',
                icon: DollarSign,
                href: '/admin/settings/payout-settings'
            }
        ]
    }
]
