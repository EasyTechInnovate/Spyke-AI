import { 
  Activity,
  Upload,
  Users,
  ShoppingCart,
  Lock,
  Percent,
  CreditCard
} from 'lucide-react';

export const appConfig = {
  company: {
    name: "Spyke AI",
    fullName: "Spyke AI API Status",
    tagline: "Where Ideas Meet Intelligence",
    description: "Discover premium AI prompts, automation solutions, and digital tools created by experts. Spyke AI is the leading marketplace for battle-tested prompts, comprehensive guides, and AI-powered automation solutions that transform your workflow.",
    uptimeTarget: "99.9%"
  },

  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    healthCheckInterval: 30000, 
    version: "v1"
  },

  theme: {
    primaryColor: "#00FF89",
    primaryText: "#121212",
    secondaryColor: "#FFC050",
    secondaryText: "#FFFFFF",
    darkColor: "#121212",
    darkText: "#00FF89",
    backgroundColor: "#FFFFFF",
    cardBackground: "white",
    borderColor: "gray-100"
  },

  services: [
    {
      id: 'health',
      name: 'System Health',
      icon: Activity,
      color: 'from-[#00FF89] to-[#FFC050]',
      healthEndpoint: '/health/self',
      description: 'Core system monitoring and self-check functionality',
      endpoints: [
        'Service Self-Check',
        'General Health Status'
      ]
    },
    {
      id: 'authentication',
      name: 'Authentication',
      icon: Lock,
      color: 'from-[#FFC050] to-[#00FF89]',
      healthEndpoint: '/auth/self',
      description: 'User authentication, registration, and account management',
      endpoints: [
        'User Registration',
        'User Login',
        'Account Confirmation',
        'Password Management',
        'Profile Management',
        'Token Refresh',
        'Notifications',
        'Email Availability Check',
        'Resend Verification Email'
      ]
    },
    {
      id: 'file-upload',
      name: 'File Upload',
      icon: Upload,
      color: 'from-[#00FF89] to-[#FFC050]',
      healthEndpoint: '/upload/self',
      description: 'Upload and manage media/documents in the system',
      endpoints: [
        'File Upload Service'
      ]
    },
    {
      id: 'seller',
      name: 'Seller Management',
      icon: Users,
      color: 'from-[#FFC050] to-[#00FF89]',
      healthEndpoint: '/seller/self',
      description: 'Seller profile management, verification, and commission handling',
      endpoints: [
        'Profile Creation',
        'Profile Management',
        'Verification Process',
        'Commission Management',
        'Stats & Analytics',
        'Payout Management',
        'Public Profile View',
        'Seller Search',
        'Admin Operations'
      ]
    },
    {
      id: 'products',
      name: 'Product Management',
      icon: ShoppingCart,
      color: 'from-[#00FF89] to-[#FFC050]',
      healthEndpoint: '/products/self',
      description: 'Product catalog, reviews, and marketplace functionality',
      endpoints: [
        'Product CRUD Operations',
        'Product Discovery',
        'Featured Products Algorithm',
        'Trending Products',
        'High Rated Products',
        'Recently Added Products',
        'Complete Discovery Dashboard',
        'Product Reviews',
        'Favorites & Upvotes',
        'Related Products',
        'Product Publishing',
        'Seller Product Management',
        'Admin Product Management',
        'Product Verification'
      ]
    },
    // {
    //   id: 'analytics',
    //   name: 'Analytics & Tracking',
    //   icon: BarChart3,
    //   color: 'from-[#FFC050] to-[#00FF89]',
    //   healthEndpoint: '/analytics/self',
    //   description: 'Event tracking, analytics, and system monitoring',
    //   endpoints: [
    //     'Event Tracking',
    //     'Analytics Data Retrieval',
    //     'Statistics Generation',
    //     'Data Management'
    //   ]
    // },
    {
      id: 'purchase',
      name: 'Purchase & Cart Management',
      icon: CreditCard,
      color: 'from-[#00FF89] to-[#FFC050]',
      healthEndpoint: '/purchase/self',
      description: 'Shopping cart, purchase processing, and order management',
      endpoints: [
        'Cart Management',
        'Add/Remove Products',
        'Cart Totals & Calculations',
        'Promocode Application',
        'Purchase Processing',
        'Purchase History',
        'Categorized Purchase View',
        'Premium Content Access',
        'Multi-seller Transactions',
        'Order Analytics'
      ]
    },
    {
      id: 'promocode',
      name: 'Promocode Management',
      icon: Percent,
      color: 'from-[#FFC050] to-[#00FF89]',
      healthEndpoint: '/promocode/self',
      description: 'Dynamic promocode creation, validation, and analytics by sellers and admins',
      endpoints: [
        'Promocode CRUD Operations',
        'Seller Promocode Management',
        'Admin Promocode Management',
        'Promocode Validation',
        'Usage Analytics & Stats',
        'Public Promocode Discovery',
        'Advanced Targeting (Products/Categories)',
        'Usage Limits & Restrictions',
        'Expiry Management',
        'Discount Calculations'
      ]
    }
  ],

  statusMessages: {
    checking: 'Checking system status...',
    allOperational: 'All systems operational',
    partialOutage: 'Some services experiencing issues',
    majorOutage: 'Multiple services down',
    unknown: 'System status unknown'
  },

  monitoring: {
    realTimeUpdates: "Status refreshes every 30 seconds",
    serviceCoverage: "Complete AI marketplace ecosystem"
  },

  healthDisplay: {
    showDetailedMetrics: true,
    showSystemInfo: true,
    showApplicationInfo: true,
    metricsToShow: {
      uptime: true,
      memoryUsage: true,
      cpuUsage: true,
      environment: true,
      responseTime: true
    }
  }
};

export const getTotalEndpoints = () => {
  return appConfig.services.reduce((total, service) => total + service.endpoints.length, 0);
};

export const buildApiUrl = (endpoint) => {
  return `${appConfig.api.baseURL}/${appConfig.api.version}${endpoint}`;
};