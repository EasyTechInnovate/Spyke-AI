'use client'

import { motion } from 'framer-motion'
import { Filter, ChevronRight } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'
import { useState } from 'react'

const filterCategories = [
  {
    title: 'By Type',
    filters: [
      { label: 'AI Prompts', value: 'type=prompt', count: '2.5k+' },
      { label: 'Automations', value: 'type=automation', count: '1.8k+' },
      { label: 'AI Agents', value: 'type=agent', count: '800+' },
      { label: 'Bundles', value: 'type=bundle', count: '350+' }
    ]
  },
  {
    title: 'By Tool',
    filters: [
      { label: 'ChatGPT', value: 'tool=chatgpt', count: '3k+' },
      { label: 'Make.com', value: 'tool=make', count: '1.2k+' },
      { label: 'Zapier', value: 'tool=zapier', count: '950+' },
      { label: 'Notion', value: 'tool=notion', count: '600+' }
    ]
  },
  {
    title: 'By Price',
    filters: [
      { label: 'Free', value: 'priceCategory=free', count: '500+' },
      { label: 'Under $20', value: 'priceCategory=under_20', count: '1.5k+' },
      { label: '$20-$50', value: 'priceCategory=20_to_50', count: '1k+' },
      { label: 'Over $50', value: 'priceCategory=over_50', count: '800+' }
    ]
  },
  {
    title: 'By Industry',
    filters: [
      { label: 'E-commerce', value: 'industry=ecommerce', count: '1.2k+' },
      { label: 'SaaS', value: 'industry=saas', count: '900+' },
      { label: 'Real Estate', value: 'industry=real_estate', count: '650+' },
      { label: 'Healthcare', value: 'industry=healthcare', count: '450+' }
    ]
  }
]

export default function QuickFilters() {
  const [hoveredFilter, setHoveredFilter] = useState(null)

  return (
    <section className="relative py-20 lg:py-24 bg-black">
      <Container>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-6">
              <Filter className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-brand-primary">
                Quick Filters
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">
              Find What You Need, Fast
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
              Browse our marketplace with smart filters to discover the perfect tools
            </p>
          </motion.div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filterCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4 font-title">
                  {category.title}
                </h3>
                
                <div className="space-y-3">
                  {category.filters.map((filter, index) => (
                    <Link
                      key={index}
                      href={`/explore?${filter.value}`}
                      className="group flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all duration-200"
                      onMouseEnter={() => setHoveredFilter(`${categoryIndex}-${index}`)}
                      onMouseLeave={() => setHoveredFilter(null)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-brand-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-body">
                          {filter.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                          {filter.count}
                        </span>
                        <ChevronRight 
                          className={`w-4 h-4 text-gray-600 transition-all duration-200 ${
                            hoveredFilter === `${categoryIndex}-${index}` 
                              ? 'translate-x-1 text-brand-primary' 
                              : ''
                          }`}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-gray-700 transition-all duration-200 group font-body"
            >
              <span>Advanced Search</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}