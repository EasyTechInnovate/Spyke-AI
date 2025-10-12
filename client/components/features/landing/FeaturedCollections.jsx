'use client'
import { motion } from 'framer-motion'
import { TrendingUp, Award, Zap, Package, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useEffect } from 'react'

const BackgroundEffectsLight = dynamic(() => import('./hero/BackgroundEffectsLight'), {
  ssr: false,
  loading: () => null
})

const BRAND = '#00FF89'
const AMBER = '#FFC050'

const collections = [
  {
    id: 'top-sales-agents',
    title: 'Top Sales Agents',
    description: 'AI-powered sales automation tools that convert',
    icon: TrendingUp,
    color: BRAND,
    bgColor: 'rgba(0, 255, 137, 0.1)',
    borderColor: 'rgba(0, 255, 137, 0.2)',
    link: '/explore?type=agent&category=sales',
    stats: '500+ sales'
  },
  {
    id: 'trending-prompts',
    title: 'Trending Prompts',
    description: 'Most popular prompts this week',
    icon: Award,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    link: '/explore?type=prompt&sortBy=popularity',
    stats: '1k+ uses'
  },
  {
    id: 'productivity-hacks',
    title: 'Productivity Hacks',
    description: 'Save hours with these automation tools',
    icon: Zap,
    color: AMBER,
    bgColor: 'rgba(255, 192, 80, 0.1)',
    borderColor: 'rgba(255, 192, 80, 0.2)',
    link: '/explore?category=productivity&sortBy=rating',
    stats: '4.8+ rating'
  },
  {
    id: 'starter-bundles',
    title: 'Starter Bundles',
    description: 'Complete packages for beginners',
    icon: Package,
    color: '#00AFFF',
    bgColor: 'rgba(0, 175, 255, 0.1)',
    borderColor: 'rgba(0, 175, 255, 0.2)',
    link: '/explore?type=bundle&priceCategory=under_20',
    stats: 'Under $20'
  }
]

export default function FeaturedCollections() {
  const { track } = useAnalytics()

  useEffect(() => {
    // Track collections section view
    track.engagement.featureUsed('featured_collections_section_viewed', {
      collections_count: collections.length,
      source: 'landing_page'
    });
  }, [track]);

  const handleCollectionClick = (collection, index) => {
    track.engagement.featureUsed('featured_collection_clicked', {
      collection_id: collection.id,
      collection_title: collection.title,
      collection_stats: collection.stats,
      position: index,
      destination_url: collection.link,
      source: 'landing_collections'
    });

    track.conversion.funnelStepCompleted('collection_to_explore', {
      collection_id: collection.id,
      collection_title: collection.title,
      cta_type: 'collection_card',
      source: 'landing_collections'
    });

    track.engagement.headerLinkClicked(`collection_${collection.id}`, collection.link);
  };

  return (
    <section className="relative overflow-hidden bg-black">
      <BackgroundEffectsLight />
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#00FF89]" />
              <span className="text-xs sm:text-sm font-medium text-[#00FF89]">
                Curated Collections
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4">
              Featured Collections
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
              Curated collections to help you find the perfect AI tools
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Link
                  href={collection.link}
                  onClick={() => handleCollectionClick(collection, index)}
                  className="group block h-full">
                  <div className="relative h-full bg-[#171717] border border-gray-800 rounded-xl sm:rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20">
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: collection.bgColor }}
                    />
                    <div 
                      className="absolute inset-0 border border-transparent group-hover:border-opacity-50 rounded-xl sm:rounded-2xl transition-all duration-300"
                      style={{ borderColor: collection.borderColor }}
                    />
                    <div className="relative p-4 sm:p-6 flex flex-col h-full min-h-[200px] sm:min-h-[220px]">
                      <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mb-3 sm:mb-4 overflow-hidden">
                        <div 
                          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                          style={{ backgroundColor: collection.color }}
                        />
                        <div 
                          className="absolute inset-0 border border-opacity-20 rounded-lg sm:rounded-xl"
                          style={{ borderColor: collection.color }}
                        />
                        <div className="relative w-full h-full flex items-center justify-center">
                          <collection.icon 
                            className="w-5 h-5 sm:w-6 sm:h-6" 
                            style={{ color: collection.color }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 group-hover:text-gray-100 transition-colors">
                          {collection.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                          {collection.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-800/50 group-hover:border-gray-700 transition-colors">
                        <span 
                          className="text-sm sm:text-base font-medium"
                          style={{ color: collection.color }}>
                          {collection.stats}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 group-hover:text-gray-400 transition-colors">
                          <span className="text-xs sm:text-sm">View all</span>
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}