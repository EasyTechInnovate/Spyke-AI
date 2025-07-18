'use client'

import { motion } from 'framer-motion'
import { Star, TrendingUp, Award, Users } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'
import Image from 'next/image'

// Mock data - in production, this would come from API
const topCreators = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    title: 'AI Automation Expert',
    stats: {
      products: 47,
      sales: '2.3k',
      rating: 4.9,
      revenue: '$125k'
    },
    badge: 'Top Seller',
    specialties: ['ChatGPT', 'Make.com', 'Sales Automation']
  },
  {
    id: 2,
    name: 'Mike Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    title: 'Prompt Engineer',
    stats: {
      products: 89,
      sales: '5.1k',
      rating: 4.8,
      revenue: '$210k'
    },
    badge: 'Rising Star',
    specialties: ['AI Prompts', 'Content Creation', 'Marketing']
  },
  {
    id: 3,
    name: 'Emma Watson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    title: 'E-commerce Specialist',
    stats: {
      products: 32,
      sales: '1.8k',
      rating: 5.0,
      revenue: '$95k'
    },
    badge: 'Verified Expert',
    specialties: ['E-commerce', 'Zapier', 'Customer Service']
  },
  {
    id: 4,
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    title: 'Workflow Architect',
    stats: {
      products: 65,
      sales: '3.2k',
      rating: 4.7,
      revenue: '$180k'
    },
    badge: 'Community Favorite',
    specialties: ['Notion', 'Productivity', 'Team Workflows']
  }
]

export default function CreatorSpotlights() {
  return (
    <section className="relative py-20 lg:py-24 bg-gray-950">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-6">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-500">
                Creator Spotlights
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">
              Meet Top Sellers This Month
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
              Learn from the best creators building amazing AI tools and automations
            </p>
          </motion.div>

          {/* Creators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topCreators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/sellers/${creator.id}`}
                  className="group block h-full"
                >
                  <div className="relative h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10">
                    {/* Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="px-3 py-1 text-xs font-bold bg-brand-primary text-brand-primary-text rounded-full">
                        {creator.badge}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col h-full">
                      {/* Profile */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="relative">
                          <Image
                            src={creator.avatar}
                            alt={creator.name}
                            width={60}
                            height={60}
                            className="rounded-full border-2 border-gray-800 group-hover:border-brand-primary transition-colors"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-brand-primary transition-colors font-title">
                            {creator.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {creator.title}
                          </p>
                        </div>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3 h-3 text-brand-primary" />
                            <span className="text-xs text-gray-400">Sales</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{creator.stats.sales}</p>
                        </div>
                        
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-400">Rating</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{creator.stats.rating}</p>
                        </div>
                        
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Award className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-gray-400">Products</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{creator.stats.products}</p>
                        </div>
                        
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-400">Revenue</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{creator.stats.revenue}</p>
                        </div>
                      </div>
                      
                      {/* Specialties */}
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-2">Specializes in:</p>
                        <div className="flex flex-wrap gap-2">
                          {creator.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* View Profile */}
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <span className="text-sm text-brand-primary group-hover:text-brand-primary/80 transition-colors">
                          View Profile →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
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
              href="/sellers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-primary-text font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 group font-body"
            >
              Browse All Creators
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}