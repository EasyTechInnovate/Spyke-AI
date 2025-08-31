import {
    Target,
    Users,
    Mail,
    ShoppingCart,
    PenTool,
    Headphones,
    DollarSign,
    TrendingUp,
    Zap,
    BarChart3,
    MessageCircle,
    RefreshCw,
    Bot,
    Package,
    GraduationCap,
    Home,
    Store,
    Monitor,
    Heart,
    BookOpen,
    Building,
    Wrench,
    Briefcase,
    Timer,
    Clock3,
    AlarmClock,
    Gift,
    CreditCard,
    Wallet,
    Gem,
    Calendar,
    Flame,
    Star,
    ArrowUp,
    ShoppingBag
} from 'lucide-react'

export const PRODUCT_CATEGORIES = [
    { id: 'lead_generation', name: 'Lead Generation', icon: Target, iconName: 'Target' },
    { id: 'hiring', name: 'Hiring', icon: Users, iconName: 'Users' },
    { id: 'follow_ups', name: 'Follow Ups', icon: Mail, iconName: 'Mail' },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart, iconName: 'ShoppingCart' },
    { id: 'content_creation', name: 'Content Creation', icon: PenTool, iconName: 'PenTool' },
    { id: 'customer_service', name: 'Customer Service', icon: Headphones, iconName: 'Headphones' },
    { id: 'sales', name: 'Sales', icon: DollarSign, iconName: 'DollarSign' },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp, iconName: 'TrendingUp' },
    { id: 'productivity', name: 'Productivity', icon: Zap, iconName: 'Zap' },
    { id: 'analysis', name: 'Analysis', icon: BarChart3, iconName: 'BarChart3' }
]

export const PRODUCT_TYPES = [
    { id: 'prompt', name: 'Prompt', icon: MessageCircle, iconName: 'MessageCircle', description: 'AI prompts for various tasks' },
    { id: 'automation', name: 'Automation', icon: RefreshCw, iconName: 'RefreshCw', description: 'Automation workflows and tools' },
    { id: 'agent', name: 'Agent', icon: Bot, iconName: 'Bot', description: 'AI agents and assistants' },
    { id: 'bundle', name: 'Bundle', icon: Package, iconName: 'Package', description: 'Package deals and bundles' }
]

export const PRODUCT_INDUSTRIES = [
    { id: 'coaching', name: 'Coaching', icon: GraduationCap, iconName: 'GraduationCap' },
    { id: 'real_estate', name: 'Real Estate', icon: Home, iconName: 'Home' },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingBag, iconName: 'ShoppingBag' },
    { id: 'saas', name: 'SaaS', icon: Monitor, iconName: 'Monitor' },
    { id: 'local_business', name: 'Local Business', icon: Store, iconName: 'Store' },
    { id: 'healthcare', name: 'Healthcare', icon: Heart, iconName: 'Heart' },
    { id: 'education', name: 'Education', icon: BookOpen, iconName: 'BookOpen' },
    { id: 'finance', name: 'Finance', icon: Building, iconName: 'Building' },
    { id: 'technology', name: 'Technology', icon: Wrench, iconName: 'Wrench' },
    { id: 'consulting', name: 'Consulting', icon: Briefcase, iconName: 'Briefcase' }
]

export const PRODUCT_SETUP_TIMES = [
    { id: 'instant', name: 'Instant', icon: Zap, description: 'Ready to use immediately' },
    { id: 'under_30_mins', name: 'Under 30 minutes', icon: Timer, description: 'Quick setup required' },
    { id: 'under_1_hour', name: 'Under 1 hour', icon: Clock3, description: 'Moderate setup time' },
    { id: 'over_1_hour', name: 'Over 1 hour', icon: AlarmClock, description: 'Extended setup required' }
]

export const PRODUCT_PRICE_CATEGORIES = [
    { id: 'free', name: 'Free', min: 0, max: 0, icon: Gift },
    { id: 'under_20', name: 'Under $20', min: 1, max: 19, icon: CreditCard },
    { id: '20_to_50', name: '$20 to $50', min: 20, max: 50, icon: Wallet },
    { id: 'over_50', name: 'Over $50', min: 51, max: 999999, icon: Gem }
]

export const PRODUCT_SORT_OPTIONS = [
    { id: 'createdAt', name: 'Recently Added', icon: Calendar },
    { id: 'popularity', name: 'Most Popular', icon: Flame },
    { id: 'rating', name: 'Highest Rated', icon: Star },
    { id: 'price', name: 'Price: Low to High', icon: ArrowUp },
    { id: 'sales', name: 'Best Selling', icon: TrendingUp }
]

// Helper functions
export const getCategoryById = (id) => PRODUCT_CATEGORIES.find((cat) => cat.id === id)
export const getTypeById = (id) => PRODUCT_TYPES.find((type) => type.id === id)
export const getIndustryById = (id) => PRODUCT_INDUSTRIES.find((industry) => industry.id === id)
export const getSetupTimeById = (id) => PRODUCT_SETUP_TIMES.find((time) => time.id === id)
export const getPriceCategoryById = (id) => PRODUCT_PRICE_CATEGORIES.find((price) => price.id === id)
export const getSortOptionById = (id) => PRODUCT_SORT_OPTIONS.find((sort) => sort.id === id)

// Get display name for any filter value
export const getFilterDisplayName = (filterType, value) => {
    switch (filterType) {
        case 'category':
            return getCategoryById(value)?.name || value
        case 'type':
            return getTypeById(value)?.name || value
        case 'industry':
            return getIndustryById(value)?.name || value
        case 'setupTime':
            return getSetupTimeById(value)?.name || value
        case 'priceCategory':
            return getPriceCategoryById(value)?.name || value
        case 'sortBy':
            return getSortOptionById(value)?.name || value
        default:
            return value
    }
}

// Default filter state
export const DEFAULT_FILTERS = {
    category: 'all',
    type: 'all',
    industry: 'all',
    setupTime: 'all',
    priceRange: [0, 1000],
    rating: 0,
    verifiedOnly: false,
    search: ''
}
