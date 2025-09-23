'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import productsAPI from '@/lib/api/products'
import { PRODUCT_CATEGORIES } from '@/lib/constants/filterMappings'
import { Package, ChevronRight, BarChart3, Users, ArrowUpRight } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { motion, AnimatePresence } from 'framer-motion'
export default function CategoriesGrid({ blogCategories = [] }) {
  const [counts, setCounts] = useState({})
  const [categoryProducts, setCategoryProducts] = useState({})
  const [hoveredCard, setHoveredCard] = useState(null)
  const refsMap = useRef({})
  const observerRef = useRef(null)
  const fetchCount = useCallback(async (catId) => {
    if (counts[catId] !== undefined && counts[catId] !== -1) return
    setCounts((prev) => ({ ...prev, [catId]: -1 }))
    try {
      const res = await productsAPI.getProducts({ category: catId, page: 1, limit: 3 })
      const maybeData = res?.data ?? res
      const pagination = maybeData?.pagination ?? maybeData?.meta ?? maybeData
      const total = pagination?.totalItems ?? pagination?.total ?? maybeData?.totalItems ?? maybeData?.total ?? (Array.isArray(maybeData?.products) ? maybeData.products.length : undefined) ?? 0
      setCounts((prev) => ({ ...prev, [catId]: total }))
      if (maybeData?.products && Array.isArray(maybeData.products)) {
        setCategoryProducts((prev) => ({ ...prev, [catId]: maybeData.products.slice(0, 3) }))
      }
    } catch (err) {
      setCounts((prev) => ({ ...prev, [catId]: null }))
    }
  }, []) 
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target?.dataset?.categoryId
        if (!id) return
        if (entry.isIntersecting) {
          fetchCount(id)
          observerRef.current.unobserve(entry.target)
        }
      })
    }, { rootMargin: '200px' })
    Object.values(refsMap.current).forEach((el) => {
      if (el) observerRef.current.observe(el)
    })
    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [fetchCount]) 
  const humanizeId = (id) => id.replace(/[_-]/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  }
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
      <Container className="relative z-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg mb-6 mt-6">
            <BarChart3 className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300 font-medium">Product Categories</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Browse by Category
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Explore our comprehensive collection of AI-powered solutions,
            organized by business function and use case.
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {PRODUCT_CATEGORIES.map((cat, index) => {
            const Icon = cat.icon || Package
            const isHovered = hoveredCard === cat.id
            return (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                onHoverStart={() => setHoveredCard(cat.id)}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                className="group"
              >
                <Link
                  href={`/explore?category=${cat.id}`}
                  ref={(el) => { refsMap.current[cat.id] = el }}
                  data-category-id={cat.id}
                  className="block h-full p-6 bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-xl transition-all duration-300 hover:bg-gray-900/60 hover:border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-black"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg flex items-center justify-center border border-green-500/20">
                        <Icon className="w-7 h-7 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                          {humanizeId(cat.id)}
                        </div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-green-300 transition-colors duration-300">
                          {cat.name}
                        </h3>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>
                  {cat.description && (
                    <p className="text-gray-400 group-hover:text-gray-300 mb-6 text-sm leading-relaxed transition-colors duration-300">
                      {cat.description}
                    </p>
                  )}
                  {categoryProducts[cat.id] && categoryProducts[cat.id].length > 0 && (
                    <div className="mb-6 p-4 bg-black/20 rounded-lg border border-gray-700/30">
                      <div className="text-xs text-gray-500 mb-2 font-medium">Product:</div>
                      <div className="text-sm text-gray-300 font-medium">
                        {categoryProducts[cat.id][0].title}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/30 mt-auto">
                    <div className="flex items-center gap-2">
                      {counts[cat.id] === -1 || counts[cat.id] === undefined ? (
                        <>
                          <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-500 font-medium">Loading</span>
                        </>
                      ) : counts[cat.id] === null ? (
                        <span className="text-xs text-gray-500">Unavailable</span>
                      ) : counts[cat.id] === 0 ? (
                        <span className="text-xs text-gray-500">No products</span>
                      ) : (
                        <>
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400 font-semibold">
                            {counts[cat.id]} {counts[cat.id] !== 1 ? 'Products' : 'Product'}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-green-400 transition-colors duration-300 font-medium">
                      VIEW ALL
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </div>
  )
}