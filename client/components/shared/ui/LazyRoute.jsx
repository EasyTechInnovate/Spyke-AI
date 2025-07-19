'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Loading component for routes
const RouteLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
)

// Helper to create lazy-loaded routes
export function createLazyRoute(importFn, options = {}) {
  const LazyComponent = dynamic(importFn, {
    loading: () => <RouteLoader />,
    ssr: options.ssr ?? true,
    ...options
  })

  return function LazyRoute(props) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Pre-built lazy routes for common pages
export const LazyRoutes = {
  // Public routes
  Explore: createLazyRoute(() => import('@/app/(public)/explore/page')),
  Cart: createLazyRoute(() => import('@/app/(public)/cart/page')),
  Product: createLazyRoute(() => import('@/app/(public)/products/[id]/page')),
  
  // Auth routes
  SignIn: createLazyRoute(() => import('@/app/(public)/signin/page'), { ssr: false }),
  SignUp: createLazyRoute(() => import('@/app/(public)/signup/page'), { ssr: false }),
  
  // Protected routes
  Dashboard: createLazyRoute(() => import('@/app/(protected)/dashboard/page'), { ssr: false }),
  Account: createLazyRoute(() => import('@/app/(protected)/account/page'), { ssr: false }),
}