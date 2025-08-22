'use client'

import { motion } from 'framer-motion'
import { Filter, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const BRAND = '#00FF89'

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
    <section className="relative overflow-hidden bg-[#121212]">
      {/* Background with theme consistency */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(700px 350px at 80% 0%, rgba(0,255,137,.04), transparent), radial-gradient(500px 250px at 20% 100%, rgba(255,192,80,.04), transparent)'
          }}
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full mb-4 sm:mb-6">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-[#00FF89]" />
              <span className="text-xs sm:text-sm font-medium text-[#00FF89]">
                Quick Filters
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4">
              Find What You Need, Fast
            </h2>
            
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
              Browse our marketplace with smart filters to discover the perfect tools
            </p>
          </motion.div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filterCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="bg-[#171717] border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-gray-700 transition-all duration-300">
                
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                  {category.title}
                </h3>
                
                <div className="space-y-2 sm:space-y-3">
                  {category.filters.map((filter, index) => (
                    <Link
                      key={index}
                      href={`/explore?${filter.value}`}
                      className="group flex items-center justify-between p-2 sm:p-3 bg-[#0f0f0f] border border-gray-800/50 rounded-lg hover:bg-[#1a1a1a] hover:border-[#00FF89]/30 transition-all duration-200"
                      onMouseEnter={() => setHoveredFilter(`${categoryIndex}-${index}`)}
                      onMouseLeave={() => setHoveredFilter(null)}>
                      
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div 
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" 
                          style={{ backgroundColor: BRAND }}
                        />
                        <span className="text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
                          {filter.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                          {filter.count}
                        </span>
                        <ChevronRight 
                          className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 transition-all duration-200 ${
                            hoveredFilter === `${categoryIndex}-${index}` 
                              ? 'translate-x-0.5 sm:translate-x-1' 
                              : ''
                          }`}
                          style={{
                            color: hoveredFilter === `${categoryIndex}-${index}` ? BRAND : ''
                          }}
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
            className="text-center mt-12 sm:mt-16">
            
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#171717] text-white border border-gray-700 rounded-xl hover:bg-[#1a1a1a] hover:border-[#00FF89]/50 transition-all duration-200">
              <span className="text-sm sm:text-base">Advanced Search</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}