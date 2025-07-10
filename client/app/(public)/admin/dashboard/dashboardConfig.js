import { Bell, DollarSign, FileText, Globe, LayoutDashboard, Megaphone, Package, Settings, Shield, UserCheck, Users } from 'lucide-react'

export const navigationItems = [
    {
        id: 'overview',
        label: 'Dashboard Overview',
        icon: LayoutDashboard,
        badge: null
    },
    {
        id: 'sellers',
        label: 'Seller Management',
        icon: UserCheck,
        badge: '12',
        subItems: [
            { id: 'pending-sellers', label: 'Pending Approval' },
            { id: 'active-sellers', label: 'Active Sellers' },
            { id: 'payouts', label: 'Payout Tracking' }
        ]
    },
    {
        id: 'products',
        label: 'Product Moderation',
        icon: Shield,
        badge: '23',
        subItems: [
            { id: 'pending-products', label: 'Pending Review' },
            { id: 'flagged-products', label: 'Flagged Items' },
            { id: 'featured-products', label: 'Featured Products' }
        ]
    },
    {
        id: 'catalog',
        label: 'Product Catalog',
        icon: Package,
        subItems: [
            { id: 'all-products', label: 'All Products' },
            { id: 'bulk-edit', label: 'Bulk Edit' },
            { id: 'categories', label: 'Categories & Tags' }
        ]
    },
    {
        id: 'buyers',
        label: 'Buyer Management',
        icon: Users,
        subItems: [
            { id: 'orders', label: 'Orders' },
            { id: 'refunds', label: 'Refunds' },
            { id: 'reports', label: 'User Reports' }
        ]
    },
    {
        id: 'revenue',
        label: 'Revenue Tracking',
        icon: DollarSign,
        subItems: [
            { id: 'platform-earnings', label: 'Platform Earnings' },
            { id: 'seller-earnings', label: 'Seller Earnings' },
            { id: 'affiliate-income', label: 'Affiliate Income' }
        ]
    },
    {
        id: 'content',
        label: 'Content/Blog',
        icon: FileText,
        subItems: [
            { id: 'articles', label: 'Articles' },
            { id: 'authors', label: 'Authors' },
            { id: 'blog-categories', label: 'Categories' }
        ]
    },
    {
        id: 'seo',
        label: 'SEO Pages',
        icon: Globe,
        badge: 'New',
        subItems: [
            { id: 'dynamic-pages', label: 'Dynamic Pages' },
            { id: 'page-builder', label: 'Page Builder' },
            { id: 'traffic-analytics', label: 'Traffic Analytics' }
        ]
    },
    {
        id: 'campaigns',
        label: 'Campaign Builder',
        icon: Megaphone,
        subItems: [
            { id: 'banners', label: 'Homepage Banners' },
            { id: 'collections', label: 'Seasonal Collections' },
            { id: 'featured-sellers', label: 'Featured Sellers' }
        ]
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        badge: '5',
        subItems: [
            { id: 'email-templates', label: 'Email Templates' },
            { id: 'automation', label: 'Automation Rules' },
            { id: 'feedback-queue', label: 'Feedback Queue' }
        ]
    },
    {
        id: 'settings',
        label: 'Platform Settings',
        icon: Settings
    }
]

