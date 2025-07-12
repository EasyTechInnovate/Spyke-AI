import { 
  Activity,
  Upload
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
      healthEndpoint: '/health',
      description: 'Core system monitoring and self-check functionality',
      endpoints: [
        'Service Self-Check', 
        'General Health Status'
      ]
    },
    {
      id: 'file-upload',
      name: 'File Upload',
      icon: Upload, 
      color: 'from-[#FFC050] to-[#00FF89]',
      healthEndpoint: '/upload/health',
      description: 'Upload and manage media/documents in the system',
      endpoints: [
        'Upload File'
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