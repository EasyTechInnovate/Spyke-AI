export const ANALYTICS_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false', // Enabled by default
  debug: process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  
  // PostHog configuration
  posthog: {
    apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  },
  
  // Event batching
  batchSize: 10,
  batchInterval: 5000, // 5 seconds
  
  // Storage
  storageKey: 'spyke_analytics',
  sessionKey: 'spyke_session',
  maxStoredEvents: 100,
  
  // Privacy
  respectDoNotTrack: true,
  anonymizeIp: true,
  
  // Performance monitoring thresholds
  performance: {
    sampleRate: 0.1, // 10% sampling
    slowPageThreshold: 3000, // 3 seconds
  },
  
  // Event configuration
  events: {
    // Automatically track these events
    autoTrack: {
      pageViews: true,
      clicks: true,
      forms: true,
      errors: true,
      performance: true,
    },
    
    // Ignore these selectors
    ignoreSelectors: [
      '[data-analytics-ignore]',
      '[data-no-track]',
      '.analytics-ignore',
    ],
    
    // Only track clicks on these elements
    clickTargets: [
      'a',
      'button',
      '[role="button"]',
      '[data-analytics-track]',
      '.track-click',
    ],
  },
}