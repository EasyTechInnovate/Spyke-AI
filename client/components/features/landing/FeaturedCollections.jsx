'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Award, Zap, Package } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'

const collections = [
  {
    id: 'top-sales-agents',
    title: 'Top Sales Agents',
    description: 'AI-powered sales automation tools that convert',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    link: '/explore?type=agent&category=sales&sortBy=sales',
    stats: '500+ sales'
  },
  {
    id: 'trending-prompts',
    title: 'Trending Prompts',
    description: 'Most popular prompts this week',
    icon: Award,
    color: 'from-purple-500 to-pink-500',
    link: '/explore?type=prompt&sortBy=popularity',
    stats: '1k+ uses'
  },
  {
    id: 'productivity-hacks',
    title: 'Productivity Hacks',
    description: 'Save hours with these automation tools',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    link: '/explore?category=productivity&sortBy=rating',
    stats: '4.8+ rating'
  },
  {
    id: 'starter-bundles',
    title: 'Starter Bundles',
    description: 'Complete packages for beginners',
    icon: Package,
    color: 'from-green-500 to-emerald-500',
    link: '/explore?type=bundle&priceCategory=under_20',
    stats: 'Under $20'
  }
]

export default function FeaturedCollections() {
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">
              Featured Collections
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
              Curated collections to help you find the perfect AI tools
            </p>
          </motion.div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={collection.link}
                  className="group block h-full"
                >
                  <div className="relative h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:transform hover:scale-[1.02]">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${collection.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    
                    {/* Content */}
                    <div className="relative p-6 flex flex-col h-full">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${collection.color} flex items-center justify-center mb-4`}>
                        <collection.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      {/* Title & Description */}
                      <h3 className="text-xl font-semibold text-white mb-2 font-title">
                        {collection.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 flex-1 font-body">
                        {collection.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-brand-primary">
                          {collection.stats}
                        </span>
                        <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                          View all →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}