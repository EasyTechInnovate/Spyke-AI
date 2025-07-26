'use client'

import dynamic from 'next/dynamic'

// Lazy load analytics components
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(mod => ({ default: mod.Analytics })),
  { ssr: false }
)

const UnifiedConsentBanner = dynamic(
  () => import('../shared/UnifiedConsentBanner'),
  { ssr: false }
)



export default function AnalyticsWrapper() {
  const isProduction = process.env.NODE_ENV === 'production'
  const isVercel = process.env.VERCEL === '1'

  return (
    <>
      {isProduction && isVercel && <Analytics />}
      <UnifiedConsentBanner />
    </>
  )
}