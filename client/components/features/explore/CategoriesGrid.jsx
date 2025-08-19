'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import productsAPI from '@/lib/api/products'
import { CATEGORIES } from '@/data/explore/constants'
import { Package, ChevronRight } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { motion, AnimatePresence } from 'framer-motion'

export default function CategoriesGrid({ blogCategories = [] }) {
  const [counts, setCounts] = useState({})
  // counts values: undefined -> not requested yet, -1 -> loading, null -> error, number >= 0 -> loaded
  const refsMap = useRef({})
  const observerRef = useRef(null)

  const fetchCount = useCallback(async (catId) => {
    // avoid duplicate fetches
    if (counts[catId] !== undefined && counts[catId] !== -1) return
    setCounts((prev) => ({ ...prev, [catId]: -1 }))
    try {
      const res = await productsAPI.getProducts({ category: catId, page: 1, limit: 1 })
      const maybeData = res?.data ?? res
      const pagination = maybeData?.pagination ?? maybeData?.meta ?? maybeData
      const total = pagination?.totalItems ?? pagination?.total ?? maybeData?.totalItems ?? maybeData?.total ?? (Array.isArray(maybeData?.products) ? maybeData.products.length : undefined) ?? 0
      setCounts((prev) => ({ ...prev, [catId]: total }))
    } catch (err) {
      setCounts((prev) => ({ ...prev, [catId]: null }))
    }
  }, [counts])

  useEffect(() => {
    // Create an intersection observer to lazy-load counts when cards enter viewport
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

    // observe all refs that exist initially
    Object.values(refsMap.current).forEach((el) => {
      if (el) observerRef.current.observe(el)
    })

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [fetchCount])

  const humanizeId = (id) => id.replace(/[_-]/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  }

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Categories</h1>
        <p className="text-gray-400 mt-2">Browse AI product categories — filter and discover tools, prompts, and templates.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
          const Icon = cat.icon || Package
          return (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link
                href={`/explore?category=${cat.id}`}
                ref={(el) => { refsMap.current[cat.id] = el }}
                data-category-id={cat.id}
                className="group block p-4 bg-gray-900/50 border border-gray-800 rounded-2xl transform transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center"
                    style={cat.color ? { background: `linear-gradient(135deg, ${cat.color}22, transparent)` } : { background: 'linear-gradient(135deg, rgba(16,185,129,0.08), transparent)' }}
                  >
                    <div className="w-10 h-10 rounded-md bg-black/40 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-primary" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wider">{humanizeId(cat.id)}</div>
                    <div className="mt-1 text-lg font-semibold text-white truncate">{cat.name}</div>
                    {cat.description && (
                      <div className="text-sm text-gray-400 mt-1 line-clamp-2">{cat.description}</div>
                    )}
                  </div>

                  <div className="ml-3 flex flex-col items-end justify-center gap-1">
                    <div className="text-sm text-gray-400">
                      {counts[cat.id] === -1 || counts[cat.id] === undefined ? (
                        // skeleton
                        <span className="inline-block w-16 h-3 bg-gray-800 rounded animate-pulse" />
                      ) : counts[cat.id] === null ? (
                        <span>—</span>
                      ) : counts[cat.id] === 0 ? (
                        <span>No products</span>
                      ) : (
                        <span>{counts[cat.id]} {counts[cat.id] !== 1 ? 'products' : 'product'}</span>
                      )}
                    </div>
                    <div className="mt-1">
                      <ChevronRight className="w-4 h-4 text-gray-500 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>

      {blogCategories && blogCategories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-4">Blog Categories</h2>
          <div className="flex gap-2 flex-wrap">
            {blogCategories.map((b) => (
              <div key={b._id} className="px-3 py-1.5 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700">
                {b.title} {b.postCount != null ? `· ${b.postCount}` : ''}
              </div>
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
