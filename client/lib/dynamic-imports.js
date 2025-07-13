import dynamic from 'next/dynamic'

// Loading components
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
  </div>
)

export const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
  </div>
)

// Framer Motion components - lazy loaded
export const motion = {
  div: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.div })), {
    ssr: false,
    loading: () => null
  }),
  section: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.section })), {
    ssr: false,
    loading: () => null
  }),
  article: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.article })), {
    ssr: false,
    loading: () => null
  }),
  span: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.span })), {
    ssr: false,
    loading: () => null
  }),
  button: dynamic(() => import('framer-motion').then(mod => ({ default: mod.motion.button })), {
    ssr: false,
    loading: () => null
  })
}

export const AnimatePresence = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.AnimatePresence })),
  { ssr: false }
)

// Heavy components - lazy loaded
export const ChartComponents = {
  LineChart: dynamic(() => import('recharts').then(mod => ({ default: mod.LineChart })), {
    loading: LoadingSpinner,
    ssr: false
  }),
  BarChart: dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), {
    loading: LoadingSpinner,
    ssr: false
  }),
  PieChart: dynamic(() => import('recharts').then(mod => ({ default: mod.PieChart })), {
    loading: LoadingSpinner,
    ssr: false
  })
}

// Icon libraries - lazy loaded
export const Icons = {
  Lucide: dynamic(() => import('lucide-react'), {
    loading: () => null,
    ssr: false
  }),
  ReactIcons: dynamic(() => import('react-icons'), {
    loading: () => null,
    ssr: false
  })
}