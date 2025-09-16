// Common constants and enums for admin analytics
import { Clock, Calendar } from 'lucide-react'

export const TIME_RANGES = {
    TODAY: 'today',
    SEVEN_DAYS: '7d',
    THIRTY_DAYS: '30d',
    NINETY_DAYS: '90d',
    ONE_YEAR: '1y',
    CUSTOM: 'custom'
}

export const TIME_RANGE_OPTIONS = [
    { value: TIME_RANGES.TODAY, label: 'Today', icon: Clock },
    { value: TIME_RANGES.SEVEN_DAYS, label: 'Last 7 days', icon: Calendar },
    { value: TIME_RANGES.THIRTY_DAYS, label: 'Last 30 days', icon: Calendar },
    { value: TIME_RANGES.NINETY_DAYS, label: 'Last 90 days', icon: Calendar },
    { value: TIME_RANGES.ONE_YEAR, label: 'Last year', icon: Calendar },
    { value: TIME_RANGES.CUSTOM, label: 'Custom range', icon: Calendar }
]

export const ANALYTICS_TABS = {
    OVERVIEW: 'overview',
    USERS: 'users',
    SALES: 'sales',
    PRODUCTS: 'products',
    PAYOUTS: 'payouts',
    SELLERS: 'sellers',
    PROMOCODES: 'promocodes',
    REVENUE: 'revenue',
    USER_TRENDS: 'user-trends',
    SELLER_TRENDS: 'seller-trends',
    FEEDBACK: 'feedback',
    TRAFFIC: 'traffic'
}

export const ADMIN_TAB_OPTIONS = [
    { value: ANALYTICS_TABS.OVERVIEW, label: 'Overview', icon: 'BarChart3' },
    { value: ANALYTICS_TABS.USERS, label: 'Users', icon: 'Users' },
    { value: ANALYTICS_TABS.SALES, label: 'Sales', icon: 'ShoppingCart' },
    { value: ANALYTICS_TABS.PRODUCTS, label: 'Products', icon: 'Package' },
    { value: ANALYTICS_TABS.PAYOUTS, label: 'Payouts', icon: 'DollarSign' },
    { value: ANALYTICS_TABS.SELLERS, label: 'Sellers', icon: 'Users' },
    { value: ANALYTICS_TABS.PROMOCODES, label: 'Promocodes', icon: 'Activity' },
    { value: ANALYTICS_TABS.REVENUE, label: 'Revenue', icon: 'DollarSign' },
    { value: ANALYTICS_TABS.USER_TRENDS, label: 'User Trends', icon: 'BarChart3' },
    { value: ANALYTICS_TABS.SELLER_TRENDS, label: 'Seller Trends', icon: 'BarChart3' },
    { value: ANALYTICS_TABS.FEEDBACK, label: 'Feedback', icon: 'Activity' },
    { value: ANALYTICS_TABS.TRAFFIC, label: 'Traffic', icon: 'Activity' },
]

export const SELLER_ANALYTICS_TABS = {
    OVERVIEW: 'overview',
    REVENUE: 'revenue',
    PERFORMANCE: 'performance'
}

export const SELLER_TAB_OPTIONS = [
    { 
        key: SELLER_ANALYTICS_TABS.OVERVIEW, 
        label: 'Overview', 
        icon: 'BarChart3',
        description: 'Combined metrics overview' 
    },
    { 
        key: SELLER_ANALYTICS_TABS.REVENUE, 
        label: 'Revenue', 
        icon: 'Activity',
        description: 'Revenue trends analysis' 
    },
    { 
        key: SELLER_ANALYTICS_TABS.PERFORMANCE, 
        label: 'Performance', 
        icon: 'Users',
        description: 'Conversion rate analytics' 
    }
]

// Legacy support - will be deprecated
export const TAB_OPTIONS = ADMIN_TAB_OPTIONS

export const CHART_TYPES = {
    LINE: 'line',
    BAR: 'bar',
    AREA: 'area',
    COMPOSED: 'composed',
    PIE: 'pie'
}

export const METRIC_COLORS = {
    BLUE: 'blue',
    EMERALD: 'emerald',
    PURPLE: 'purple',
    AMBER: 'amber',
    ROSE: 'rose',
    CYAN: 'cyan',
    INDIGO: 'indigo'
}

export const COLOR_SCHEMES = {
    [METRIC_COLORS.BLUE]: { 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/20', 
        text: 'text-blue-400', 
        icon: 'text-blue-400',
        hex: '#3B82F6'
    },
    [METRIC_COLORS.EMERALD]: { 
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/20', 
        text: 'text-emerald-400', 
        icon: 'text-emerald-400',
        hex: '#00FF89'
    },
    [METRIC_COLORS.PURPLE]: { 
        bg: 'bg-purple-500/10', 
        border: 'border-purple-500/20', 
        text: 'text-purple-400', 
        icon: 'text-purple-400',
        hex: '#8B5CF6'
    },
    [METRIC_COLORS.AMBER]: { 
        bg: 'bg-amber-500/10', 
        border: 'border-amber-500/20', 
        text: 'text-amber-400', 
        icon: 'text-amber-400',
        hex: '#F59E0B'
    },
    [METRIC_COLORS.ROSE]: { 
        bg: 'bg-rose-500/10', 
        border: 'border-rose-500/20', 
        text: 'text-rose-400', 
        icon: 'text-rose-400',
        hex: '#EF4444'
    },
    [METRIC_COLORS.CYAN]: { 
        bg: 'bg-cyan-500/10', 
        border: 'border-cyan-500/20', 
        text: 'text-cyan-400', 
        icon: 'text-cyan-400',
        hex: '#06B6D4'
    },
    [METRIC_COLORS.INDIGO]: { 
        bg: 'bg-indigo-500/10', 
        border: 'border-indigo-500/20', 
        text: 'text-indigo-400', 
        icon: 'text-indigo-400',
        hex: '#6366F1'
    }
}

export const ALERT_SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical'
}

export const USER_ROLES = {
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
}

export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending'
}

export const PRODUCT_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    PENDING: 'pending',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended'
}

export const CHART_COLORS = [
    '#00FF89', // Emerald
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EF4444', // Rose
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#F97316', // Orange
    '#EC4899', // Pink
    '#10B981'  // Green
]

// Metric definitions and explanations
export const METRIC_DEFINITIONS = {
    // Platform Overview Metrics
    totalUsers: {
        title: "Total Users",
        description: "The complete count of all registered users on the platform, including active and inactive accounts.",
        calculation: "Sum of all user registrations since platform launch"
    },
    totalRevenue: {
        title: "Total Revenue",
        description: "The total monetary income generated from all completed transactions and sales on the platform.",
        calculation: "Sum of all successful payment transactions minus refunds"
    },
    totalProducts: {
        title: "Total Products",
        description: "The complete count of all products listed on the platform, including active and inactive listings.",
        calculation: "Sum of all product listings from all sellers"
    },
    conversionRate: {
        title: "Conversion Rate",
        description: "The percentage of visitors who complete a desired action (purchase, signup, etc.) out of total visitors.",
        calculation: "(Number of conversions ÷ Total visitors) × 100"
    },
    
    // User Analytics Metrics
    newUsers: {
        title: "New Users",
        description: "The number of users who registered for the first time during the selected time period.",
        calculation: "Count of user registrations within the specified date range"
    },
    activeUsers: {
        title: "Active Users",
        description: "Users who have performed at least one meaningful action (login, purchase, browse) during the selected period.",
        calculation: "Count of users with activity within the time period"
    },
    retentionRate: {
        title: "Retention Rate",
        description: "The percentage of users who return to the platform after their initial visit or registration.",
        calculation: "(Returning users ÷ Total users from previous period) × 100"
    },
    
    // Performance Metrics
    bounceRate: {
        title: "Bounce Rate",
        description: "The percentage of visitors who leave the website after viewing only one page without interacting further.",
        calculation: "(Single-page sessions ÷ Total sessions) × 100",
        note: "Lower bounce rate indicates better user engagement"
    },
    avgSessionDuration: {
        title: "Average Session Duration",
        description: "The average amount of time users spend on the platform during a single visit or session.",
        calculation: "Total session time ÷ Number of sessions",
        note: "Longer sessions typically indicate higher engagement"
    },
    customerSatisfaction: {
        title: "Customer Satisfaction",
        description: "A rating that measures how satisfied customers are with the platform, products, or services based on reviews and feedback.",
        calculation: "Average of all customer review ratings and satisfaction surveys",
        note: "Typically measured on a scale of 1-5 stars"
    },
    
    // Sales Metrics
    totalSales: {
        title: "Total Sales",
        description: "The total number of completed transactions and orders processed on the platform.",
        calculation: "Count of all successful order completions"
    },
    avgOrderValue: {
        title: "Average Order Value",
        description: "The average monetary value of each order or transaction completed on the platform.",
        calculation: "Total revenue ÷ Number of orders"
    },
    
    // Traffic Metrics
    pageViews: {
        title: "Page Views",
        description: "The total number of pages viewed by all visitors, including repeated views of the same page.",
        calculation: "Sum of all page loads and refreshes"
    },
    uniqueVisitors: {
        title: "Unique Visitors",
        description: "The number of distinct individuals who visited the platform during the selected time period.",
        calculation: "Count of unique IP addresses or user identifiers"
    },
    
    // Product Metrics
    activeProducts: {
        title: "Active Products",
        description: "The number of products that are currently published, available for purchase, and visible to customers.",
        calculation: "Count of products with 'published' or 'active' status"
    },
    productViews: {
        title: "Product Views",
        description: "The total number of times product pages have been viewed by users.",
        calculation: "Sum of all product page visits"
    },
    
    // Growth Metrics
    growthRate: {
        title: "Growth Rate",
        description: "The percentage increase or decrease in a metric compared to the previous time period.",
        calculation: "((Current period value - Previous period value) ÷ Previous period value) × 100"
    },
    
    // Seller Metrics
    totalSellers: {
        title: "Total Sellers",
        description: "The complete count of all registered sellers on the platform, including active and inactive accounts.",
        calculation: "Sum of all seller registrations"
    },
    activeSellers: {
        title: "Active Sellers",
        description: "Sellers who have made at least one sale or updated their listings during the selected time period.",
        calculation: "Count of sellers with recent activity or sales"
    }
}