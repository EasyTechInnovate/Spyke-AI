

(function() {
    'use strict';
    
    // Check if analytics should be enabled
    if (typeof window === 'undefined') return;
    
    // Simple page view tracking
    function trackPageView() {
        const path = window.location.pathname;
        const referrer = document.referrer || 'direct';
        
        // Track page view
        // In production, this would send data to analytics service
        
    }
    
    // Track page view on load
    if (document.readyState === 'complete') {
        trackPageView();
    } else {
        window.addEventListener('load', trackPageView);
    }
    
    // Track navigation events for SPA
    let currentPath = window.location.pathname;
    new MutationObserver(() => {
        if (window.location.pathname !== currentPath) {
            currentPath = window.location.pathname;
            trackPageView();
        }
    }).observe(document.body, { childList: true, subtree: true });
    
})();