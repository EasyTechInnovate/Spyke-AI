import amplitude from 'amplitude-js';

// Initialize Amplitude (call this once in your app)
let isInitialized = false;

const initializeAmplitude = (apiKey) => {
  if (!isInitialized && apiKey) {
    amplitude.getInstance().init(apiKey);
    isInitialized = true;
  }
};

/**
 * Generic tracking function for all analytics events
 * @param {string} eventName - The name of the event (e.g., 'signup_started', 'product_viewed')
 * @param {Object} properties - Event properties (e.g., {method: 'email', referrer: 'homepage'})
 * @param {string} userId - Optional user ID to set (if not already set)
 */
export const track = (eventName, properties = {}, userId = null) => {
  try {
    // Auto-initialize with env variable if not already done
    if (!isInitialized) {
      const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
      if (apiKey) {
        initializeAmplitude(apiKey);
      } else {
        console.warn('Amplitude API key not found. Set NEXT_PUBLIC_AMPLITUDE_API_KEY in your environment.');
        return;
      }
    }

    // Set user ID if provided
    if (userId) {
      amplitude.getInstance().setUserId(userId);
    }

    // Add common properties
    const commonProperties = {
      timestamp: new Date().toISOString(),
      device: typeof window !== 'undefined' ? (window.innerWidth <= 768 ? 'mobile' : 'web') : 'unknown',
      referrer: typeof window !== 'undefined' ? document.referrer || 'direct' : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      ...properties
    };

    amplitude.getInstance().logEvent(eventName, commonProperties);
    
    console.log(`📊 Tracked: ${eventName}`, commonProperties);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Initialize function for manual setup
export const initAnalytics = (apiKey) => {
  initializeAmplitude(apiKey);
};

// Set user properties
export const setUserProperties = (properties) => {
  try {
    const identify = new amplitude.Identify();
    Object.entries(properties).forEach(([key, value]) => {
      identify.set(key, value);
    });
    amplitude.getInstance().identify(identify);
  } catch (error) {
    console.error('Error setting user properties:', error);
  }
};

export default track;