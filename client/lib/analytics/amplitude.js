import amplitude from 'amplitude-js';

// Amplitude configuration
const AMPLITUDE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
  options: {
    saveEvents: true,
    includeUtm: true,
    includeReferrer: true,
    trackingOptions: {
      city: true,
      country: true,
      carrier: false,
      device_manufacturer: true,
      device_model: true,
      dma: false,
      ip_address: false,
      language: true,
      os_name: true,
      os_version: true,
      platform: true,
      region: true,
      version_name: true
    }
  }
};

class AmplitudeAnalytics {
  constructor() {
    this.isInitialized = false;
    this.instance = null;
  }

  /**
   * Initialize Amplitude
   */
  init() {
    if (!AMPLITUDE_CONFIG.apiKey) {
      console.warn('Amplitude API key not found. Analytics will not be tracked.');
      return;
    }

    try {
      this.instance = amplitude.getInstance();
      this.instance.init(AMPLITUDE_CONFIG.apiKey, null, AMPLITUDE_CONFIG.options);
      this.isInitialized = true;
      console.log('Amplitude initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Amplitude:', error);
    }
  }

  /**
   * Set user ID and properties
   */
  setUser(userId, userProperties = {}) {
    if (!this.isInitialized) return;

    try {
      // Set user ID
      this.instance.setUserId(userId);

      // Set user properties using Identify API
      if (Object.keys(userProperties).length > 0) {
        const identify = new amplitude.Identify();
        
        Object.entries(userProperties).forEach(([key, value]) => {
          identify.set(key, value);
        });

        this.instance.identify(identify);
      }
    } catch (error) {
      console.error('Failed to set user:', error);
    }
  }

  /**
   * Update user properties
   */
  updateUserProperties(properties) {
    if (!this.isInitialized) return;

    try {
      const identify = new amplitude.Identify();
      
      Object.entries(properties).forEach(([key, value]) => {
        identify.set(key, value);
      });

      this.instance.identify(identify);
    } catch (error) {
      console.error('Failed to update user properties:', error);
    }
  }

  /**
   * Track an event
   */
  track(eventName, eventProperties = {}) {
    if (!this.isInitialized) {
      console.warn(`Cannot track event "${eventName}": Amplitude not initialized`);
      return;
    }

    try {
      // Add common properties
      const enrichedProperties = {
        ...eventProperties,
        timestamp: new Date().toISOString(),
        platform: 'web',
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
      };

      this.instance.logEvent(eventName, enrichedProperties);
    } catch (error) {
      console.error(`Failed to track event "${eventName}":`, error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName, pageProperties = {}) {
    this.track('page_viewed', {
      page_name: pageName,
      ...pageProperties
    });
  }

  /**
   * Clear user data (for logout)
   */
  reset() {
    if (!this.isInitialized) return;

    try {
      this.instance.setUserId(null);
      this.instance.regenerateDeviceId();
    } catch (error) {
      console.error('Failed to reset user:', error);
    }
  }

  /**
   * Get instance for advanced usage
   */
  getInstance() {
    return this.instance;
  }
}

// Create singleton instance
const analytics = new AmplitudeAnalytics();

export default analytics;