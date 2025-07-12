# Analytics System Documentation

## Overview
A comprehensive, privacy-focused analytics system built with Next.js, PostHog, and Vercel Analytics.

## Features
- **Privacy-First**: All data stored locally with user consent
- **Automatic Tracking**: Page views, clicks, forms, errors, and performance metrics
- **Custom Events**: Flexible event tracking API
- **Real-time Dashboard**: View analytics data at `/analytics`
- **Performance Monitoring**: Core Web Vitals tracking
- **Export Capabilities**: CSV export of analytics data

## Usage

### Basic Event Tracking
```jsx
import { useTrackEvent } from '@/hooks/useTrackEvent'

function MyComponent() {
  const track = useTrackEvent()
  
  const handleAction = () => {
    track('Button Clicked', {
      button: 'subscribe',
      location: 'header'
    })
  }
}
```

### Click Tracking
```jsx
import { useTrackClick } from '@/hooks/useTrackEvent'

function Button() {
  const trackClick = useTrackClick('CTA Click', { cta: 'signup' })
  
  return <button onClick={trackClick}>Sign Up</button>
}
```

### Form Tracking
```jsx
import { useTrackForm } from '@/hooks/useTrackEvent'

function Form() {
  const { trackFormStart, trackFormSubmit, trackFormError } = useTrackForm('Contact Form')
  
  // Track form interactions
}
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

### Custom Configuration
Edit `lib/analytics/config.ts` to customize:
- Event batching settings
- Auto-tracking options
- Privacy settings
- Performance monitoring

## Privacy & Compliance
- Respects Do Not Track browser settings
- Requires explicit user consent
- All data stored locally by default
- IP anonymization enabled
- Sensitive data automatically sanitized

## Dashboard Access
View analytics at: `/analytics`

## Best Practices
1. Always track meaningful user interactions
2. Use descriptive event names
3. Include relevant context in properties
4. Avoid tracking sensitive information
5. Test tracking in development with debug mode