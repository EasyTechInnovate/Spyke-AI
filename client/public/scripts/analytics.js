(function() {
    'use strict';

    // Check if analytics should be enabled
    if (typeof window === 'undefined') return;

    // Initialize Meta Pixel
    function initMetaPixel() {
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');

        // Replace with your actual Meta Pixel ID
        fbq('init', 'YOUR_PIXEL_ID');
        fbq('track', 'PageView');
    }

    // Initialize Google Analytics 4
    function initGA4() {
        // Create script element for GA4
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
        document.head.appendChild(script);

        // Initialize GA4
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX'); // Replace with your GA4 Measurement ID
    }

    // Track page view events
    function trackPageView() {
        const path = window.location.pathname;
        const referrer = document.referrer || 'direct';

        // Track with Amplitude
        if (window.amplitude) {
            window.amplitude.track('Page Viewed', {
                page: path,
                referrer: referrer,
                title: document.title
            });
        }

        // Track with Google Analytics
        if (window.gtag) {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: path
            });
        }

        // Track with Meta Pixel
        if (window.fbq) {
            fbq('track', 'PageView');
        }
    }

    // Track custom events
    function trackEvent(eventName, properties = {}) {
        // Track with Amplitude
        if (window.amplitude) {
            window.amplitude.track(eventName, properties);
        }

        // Track with Google Analytics
        if (window.gtag) {
            gtag('event', eventName.toLowerCase().replace(/\s+/g, '_'), properties);
        }

        // Track with Meta Pixel
        if (window.fbq) {
            fbq('track', eventName, properties);
        }
    }

    // Track user identification
    function identifyUser(userId, userProperties = {}) {
        // Identify with Amplitude
        if (window.amplitude) {
            window.amplitude.setUserId(userId);
            window.amplitude.setUserProperties(userProperties);
        }

        // Identify with Google Analytics
        if (window.gtag) {
            gtag('config', 'G-XXXXXXXXXX', {
                user_id: userId
            });
        }

        // Identify with Meta Pixel (Advanced Matching)
        if (window.fbq && userProperties.email) {
            fbq('init', 'YOUR_PIXEL_ID', {
                em: userProperties.email,
                fn: userProperties.firstName || '',
                ln: userProperties.lastName || ''
            });
        }
    }

    // Expose tracking functions globally
    window.spykeAnalytics = {
        trackEvent: trackEvent,
        trackPageView: trackPageView,
        identifyUser: identifyUser
    };

    // Initialize all analytics services
    function initializeAnalytics() {
        initMetaPixel();
        initGA4();
    }

    // Track page view on load
    if (document.readyState === 'complete') {
        initializeAnalytics();
        trackPageView();
    } else {
        window.addEventListener('load', function() {
            initializeAnalytics();
            trackPageView();
        });
    }

    // Track navigation events for SPA
    let currentPath = window.location.pathname;
    new MutationObserver(() => {
        if (window.location.pathname !== currentPath) {
            currentPath = window.location.pathname;
            setTimeout(trackPageView, 100); // Small delay to ensure page is updated
        }
    }).observe(document.body, { childList: true, subtree: true });

    // Track common e-commerce events
    window.spykeAnalytics.trackPurchase = function(transactionData) {
        const eventData = {
            transaction_id: transactionData.id,
            value: transactionData.total,
            currency: transactionData.currency || 'USD',
            items: transactionData.items || []
        };

        // Google Analytics Enhanced E-commerce
        if (window.gtag) {
            gtag('event', 'purchase', eventData);
        }

        // Meta Pixel Purchase
        if (window.fbq) {
            fbq('track', 'Purchase', {
                value: transactionData.total,
                currency: transactionData.currency || 'USD'
            });
        }

        // Amplitude Purchase
        if (window.amplitude) {
            window.amplitude.track('Purchase Completed', eventData);
        }
    };

    window.spykeAnalytics.trackAddToCart = function(productData) {
        const eventData = {
            currency: productData.currency || 'USD',
            value: productData.price,
            items: [{
                item_id: productData.id,
                item_name: productData.name,
                item_category: productData.category,
                price: productData.price,
                quantity: 1
            }]
        };

        // Google Analytics
        if (window.gtag) {
            gtag('event', 'add_to_cart', eventData);
        }

        // Meta Pixel
        if (window.fbq) {
            fbq('track', 'AddToCart', {
                value: productData.price,
                currency: productData.currency || 'USD',
                content_ids: [productData.id],
                content_type: 'product'
            });
        }

        // Amplitude
        if (window.amplitude) {
            window.amplitude.track('Product Added to Cart', eventData);
        }
    };

    window.spykeAnalytics.trackSignUp = function(method = 'email') {
        // Google Analytics
        if (window.gtag) {
            gtag('event', 'sign_up', { method: method });
        }

        // Meta Pixel
        if (window.fbq) {
            fbq('track', 'CompleteRegistration');
        }

        // Amplitude
        if (window.amplitude) {
            window.amplitude.track('User Signed Up', { method: method });
        }
    };

    window.spykeAnalytics.trackLogin = function(method = 'email') {
        // Google Analytics
        if (window.gtag) {
            gtag('event', 'login', { method: method });
        }

        // Meta Pixel
        if (window.fbq) {
            fbq('track', 'Lead');
        }

        // Amplitude
        if (window.amplitude) {
            window.amplitude.track('User Logged In', { method: method });
        }
    };

})();