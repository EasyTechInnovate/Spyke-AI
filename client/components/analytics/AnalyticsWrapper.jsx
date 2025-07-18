'use client'

import dynamic from 'next/dynamic'

// Lazy load analytics components
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(mod => ({ default: mod.Analytics })),
  { ssr: false }
)

const ConsentBanner = dynamic(
  () => import('./ConsentBanner'),
  { ssr: false }
)

const AnalyticsDebugPanel = dynamic(
  () => import('./DebugPanel'),
  { ssr: false }
)

export default function AnalyticsWrapper() {
  const isProduction = process.env.NODE_ENV === 'production'
  const isVercel = process.env.VERCEL === '1'
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <>
      {isProduction && isVercel && <Analytics />}
      <ConsentBanner />
      {isDevelopment && <AnalyticsDebugPanel />}
    </>
  )
}