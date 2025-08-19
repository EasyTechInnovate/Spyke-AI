'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import productsAPI from '@/lib/api/products'
import { CATEGORIES } from '@/data/explore/constants'
import { Package } from 'lucide-react'

export default function CategoriesGrid({ blogCategories = [] }) {
  const [counts, setCounts] = useState({})
  const [loadingCounts, setLoadingCounts] = useState(true)

  useEffect(() => {
    // Lazy fetch product counts for visible categories (one request per category, light: limit=1)
    let mounted = true
    async function loadCounts() {
      try {
        const entries = {}
        await Promise.all(
          CATEGORIES.filter(c => c.id !== 'all').map(async (cat) => {
            try {
              const res = await productsAPI.getProducts({ category: cat.id, page: 1, limit: 1 })

              // Normalize response shapes: some API wrappers return the axios response (res.data)
              // while others may already return the data object. Try common patterns.
              const maybeData = res?.data ?? res
              const pagination = maybeData?.pagination ?? maybeData?.meta ?? maybeData

              // Try several fields that might contain the total count
              const total = pagination?.totalItems ?? pagination?.total ?? maybeData?.totalItems ?? maybeData?.total ?? (Array.isArray(maybeData?.products) ? maybeData.products.length : undefined) ?? 0

              // Dev logging to help debug zero counts in local environments
              if (process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('[CategoriesGrid] count debug', { cat: cat.id, res, maybeData, pagination, total })
              }
              entries[cat.id] = total
            } catch (e) {
              // ignore per-category failures
              entries[cat.id] = null
            }
          })
        )
        if (mounted) {
          setCounts(entries)
          setLoadingCounts(false)
        }
      } catch (err) {
        if (mounted) setLoadingCounts(false)
      }

    }

    loadCounts()
    return () => { mounted = false }
  }, [])

  const humanizeId = (id) => id.replace(/[_-]/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase())

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-6">Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
          <Link
            key={cat.id}
            href={`/explore?category=${cat.id}`}
            className="group block p-4 bg-gradient-to-b from-gray-900/60 to-gray-900 border border-gray-800 rounded-xl hover:shadow-lg hover:translate-y-[-4px] transform transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-md bg-gradient-to-br from-brand-primary/20 to-transparent flex items-center justify-center">
                <Package className="w-6 h-6 text-brand-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 uppercase tracking-wider">{humanizeId(cat.id)}</div>
                <div className="mt-1 text-lg font-semibold text-white truncate">{cat.name}</div>
                {cat.description && (
                  <div className="text-sm text-gray-400 mt-1 line-clamp-2">{cat.description}</div>
                )}
              </div>

              <div className="ml-3 text-right">
                {loadingCounts ? (
                  <div className="text-sm text-gray-500">…</div>
                ) : counts[cat.id] === null ? (
                  <div className="text-sm text-gray-400">—</div>
                ) : counts[cat.id] === 0 ? (
                  <div className="text-sm text-gray-400">No products</div>
                ) : (
                  <div className="text-sm text-gray-400">{counts[cat.id]} product{counts[cat.id] !== 1 ? 's' : ''}</div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {blogCategories && blogCategories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-4">Blog Categories</h2>
          <div className="flex gap-2 flex-wrap">
            {blogCategories.map((b) => (
              <div key={b._id} className="px-3 py-1.5 bg-gray-800 rounded-full text-sm text-gray-300">
                {b.title} {b.postCount != null ? `· ${b.postCount}` : ''}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
