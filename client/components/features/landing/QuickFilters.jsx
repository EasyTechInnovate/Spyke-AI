'use client'
import { motion } from 'framer-motion'
import { Filter, ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import Container from '@/components/shared/layout/Container'
import { 
  PRODUCT_CATEGORIES, 
  PRODUCT_TYPES, 
  PRODUCT_INDUSTRIES 
} from '@/lib/constants/filterMappings'
const BackgroundEffectsLight = dynamic(() => import('./hero/BackgroundEffectsLight'), {
  ssr: false,
  loading: () => null
})
const filterGroups = [
  {
    id: 'types',
    title: 'Product Types',
    subtitle: 'All available formats',
    icon: Filter,
    filters: PRODUCT_TYPES.map(type => ({
      id: type.id,
      label: type.name,
      icon: type.icon,
      link: `/explore?type=${type.id}`,
      description: type.description
    })),
    maxHeight: 'max-h-64' 
  },
  {
    id: 'categories',
    title: 'All Categories',
    subtitle: 'Business functions',
    icon: TrendingUp,
    filters: PRODUCT_CATEGORIES.map(category => ({
      id: category.id,
      label: category.name,
      icon: category.icon,
      link: `/explore?category=${category.id}`
    })),
    maxHeight: 'max-h-80' 
  },
  {
    id: 'industries',
    title: 'All Industries', 
    subtitle: 'Sector solutions',
    icon: Sparkles,
    filters: PRODUCT_INDUSTRIES.map(industry => ({
      id: industry.id,
      label: industry.name,
      icon: industry.icon,
      link: `/explore?industry=${industry.id}`
    })),
    maxHeight: 'max-h-80' 
  }
]
export default function QuickFilters() {
  const [hoveredFilter, setHoveredFilter] = useState(null)
  return (
    <section className="relative py-20 lg:py-24 bg-black">
      <BackgroundEffectsLight />
      <Container>
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full mb-6">
              <Filter className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-brand-primary">
                Quick Filters
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">
              Discover Tools Instantly
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
              Jump straight to what you need with our curated filter shortcuts
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {filterGroups.map((group, groupIndex) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/30 transition-all duration-300 flex flex-col h-96"
              >
                <div className="flex items-center gap-3 p-6 border-b border-gray-800 flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                    <group.icon className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white font-title">
                      {group.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-body">
                      {group.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                  {group.filters.map((filter, index) => (
                    <Link
                      key={filter.id}
                      href={filter.link}
                      className="group block"
                      onMouseEnter={() => setHoveredFilter(`${groupIndex}-${index}`)}
                      onMouseLeave={() => setHoveredFilter(null)}
                    >
                      <div className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:bg-gray-800/50 hover:border-brand-primary/30 transition-all duration-200">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors flex-shrink-0">
                            <filter.icon className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors font-body block truncate">
                              {filter.label}
                            </span>
                            {filter.description && (
                              <p className="text-xs text-gray-500 mt-0.5 font-body truncate">
                                {filter.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <ArrowRight 
                          className={`w-4 h-4 text-gray-600 transition-all duration-200 flex-shrink-0 ${
                            hoveredFilter === `${groupIndex}-${index}` 
                              ? 'translate-x-1 text-brand-primary' 
                              : 'group-hover:text-brand-primary'
                          }`}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              href="/explore"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-brand-primary/25"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}