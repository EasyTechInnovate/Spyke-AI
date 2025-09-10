import {
  LayoutDashboard,
  UserCheck,
  Package,
  Tag,
  TrendingUp,
  ShieldCheck,
  Settings
} from 'lucide-react'

// Coming Soon Features Set
export const COMING_SOON = new Set(['compliance', 'settings'])

// Navigation items factory function
export const createNavigationItems = (counts) => [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard'
  },
  {
    id: 'sellers',
    label: 'Sellers',
    icon: UserCheck,
    badge: counts.sellers.pending + counts.sellers.active || undefined,
    subItems: [
      {
        id: 'pending-sellers',
        label: 'Pending Approval',
        href: '/admin/sellers/pending',
        badge: counts.sellers.pending || undefined
      },
      {
        id: 'active-sellers',
        label: 'Active Sellers',
        href: '/admin/sellers/active',
        badge: counts.sellers.active || undefined
      },
      {
        id: 'payouts',
        label: 'Payouts',
        href: '/admin/sellers/payouts',
        badge: counts.sellers.payouts || undefined
      }
    ]
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    badge: counts.products.pending + counts.products.flagged + counts.products.featured || undefined,
    subItems: [
      {
        id: 'pending-products',
        label: 'Pending Review',
        href: '/admin/products/pending',
        badge: counts.products.pending || undefined
      },
      {
        id: 'flagged-products',
        label: 'Flagged Items',
        href: '/admin/products/flagged',
        badge: counts.products.flagged || undefined
      },
      {
        id: 'featured-products',
        label: 'Featured',
        href: '/admin/products/featured',
        badge: counts.products.featured || undefined
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
    id: 'analytics', 
    label: 'Analytics', 
    icon: TrendingUp, 
    subItems: [
      {
        id: 'platform-analytics',
        label: 'Platform Overview',
        href: '/admin/analytics/platform'
      },
      {
        id: 'user-analytics',
        label: 'User Analytics',
        href: '/admin/analytics/users'
      },
      {
        id: 'seller-analytics',
        label: 'Seller Analytics',
        href: '/admin/analytics/sellers'
      },
      {
        id: 'product-analytics',
        label: 'Product Analytics',
        href: '/admin/analytics/products'
      },
      {
        id: 'sales-analytics',
        label: 'Sales Analytics',
        href: '/admin/analytics/sales'
      },
      {
        id: 'revenue-analytics',
        label: 'Revenue Analytics',
        href: '/admin/analytics/revenue'
      },
      {
        id: 'trends-analytics',
        label: 'Trends & Insights',
        href: '/admin/analytics/trends'
      },
      {
        id: 'traffic-analytics',
        label: 'Traffic Analytics',
        href: '/admin/analytics/traffic'
      }
    ]
  },
  { 
    id: 'compliance', 
    label: 'Compliance', 
    icon: ShieldCheck, 
    href: '/admin/compliance' 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    href: '/admin/settings' 
  }
]