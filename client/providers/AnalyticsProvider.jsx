'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import tracking from '../lib/analytics/events';

const AnalyticsContext = createContext();

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize analytics
    tracking.init();
    setIsInitialized(true);

    // Track page performance
    const measurePageLoad = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        if (loadTime > 0) {
          tracking.system.pageLoadTime(window.location.pathname, loadTime);
        }
      }
    };

    // Measure page load time
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
    }

    // Global error tracking
    const handleError = (event) => {
      tracking.system.errorOccurred(
        'javascript_error',
        event.error?.message || 'Unknown error',
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      );
    };

    const handleUnhandledRejection = (event) => {
      tracking.system.errorOccurred(
        'promise_rejection',
        event.reason?.message || 'Unhandled promise rejection',
        {
          reason: event.reason
        }
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('load', measurePageLoad);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const value = {
    isInitialized,
    tracking
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};