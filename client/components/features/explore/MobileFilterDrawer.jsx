'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { X, ChevronDown, ChevronUp, Star, DollarSign } from 'lucide-react'
import { createPortal } from 'react-dom'
export default function MobileFilterDrawer({
    isOpen,
    onClose,
    filters,
    categories = [],
    productTypes = [],
    industries = [],
    setupTimes = [],
    onFilterChange
}) {
    const [open, setOpen] = useState({
        productType: true,
        category: true,
        price: true,
        industry: false,
        setup: false,
        rating: false,
        seller: false
    })
    const dialogRef = useRef(null)
    const firstFocusRef = useRef(null)
    const lastFocusRef = useRef(null)
    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => firstFocusRef.current?.focus())
        }
    }, [isOpen])
    useEffect(() => {
        const setVH = () => {
            document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
        }
        setVH()
        window.addEventListener('resize', setVH)
        return () => window.removeEventListener('resize', setVH)
    }, [])
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('mobile-filter-open')
        } else {
            document.body.classList.remove('mobile-filter-open')
        }
        return () => document.body.classList.remove('mobile-filter-open')
    }, [isOpen])
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
            if (e.key === 'Tab') {
                const focusable = dialogRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
                if (!focusable?.length) return
                const first = focusable[0]
                const last = focusable[focusable.length - 1]
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault()
                        last.focus()
                    }
                } else if (document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isOpen, onClose])
    const toggle = useCallback((k) => setOpen((o) => ({ ...o, [k]: !o[k] })), [])
    const update = useCallback((partial) => onFilterChange({ ...filters, ...partial }), [filters, onFilterChange])
    const clear = useCallback(() => {
        update({ category: 'all', type: 'all', industry: 'all', setupTime: 'all', priceRange: [0, 1000], rating: 0, verifiedOnly: false })
        onClose()
    }, [update, onClose])
    const hasActive = useMemo(
        () =>
            filters.category !== 'all' ||
            filters.type !== 'all' ||
            filters.industry !== 'all' ||
            filters.setupTime !== 'all' ||
            filters.rating > 0 ||
            filters.verifiedOnly ||
            filters.priceRange?.[0] > 0 ||
            filters.priceRange?.[1] < 1000,
        [filters]
    )
    const sections = [
        {
            key: 'productType',
            label: 'Product Type',
            items: productTypes.map((i) => ({ id: i.id, name: i.name, active: filters.type === i.id, onClick: () => update({ type: i.id }) }))
        },
        {
            key: 'category',
            label: 'Category',
            items: categories.map((i) => ({ id: i.id, name: i.name, active: filters.category === i.id, onClick: () => update({ category: i.id }) }))
        },
        {
            key: 'industry',
            label: 'Industry',
            items: industries.map((i) => ({ id: i.id, name: i.name, active: filters.industry === i.id, onClick: () => update({ industry: i.id }) }))
        },
        {
            key: 'setup',
            label: 'Setup Time',
            items: setupTimes.map((i) => ({ id: i.id, name: i.name, active: filters.setupTime === i.id, onClick: () => update({ setupTime: i.id }) }))
        }
    ]
    return isOpen
        ? createPortal(
              <AnimatePresence>
                  <>
                      <motion.div
                          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
                          onClick={onClose}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                      />
                      <motion.div
                          ref={dialogRef}
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="mobile-filters-title"
                          className="fixed right-0 top-0 h-[var(--vh)] w-full max-w-sm z-[101] lg:hidden flex flex-col bg-[#111214] text-gray-200 shadow-2xl border-l border-gray-800/60"
                          initial={{ x: '100%' }}
                          animate={{ x: 0 }}
                          exit={{ x: '100%' }}
                          transition={{ type: 'spring', damping: 26, stiffness: 260 }}>
                          <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-gray-800/70 shrink-0">
                              <div className="flex items-center gap-3">
                                  <h2
                                      id="mobile-filters-title"
                                      className="text-lg font-semibold tracking-wide">
                                      Filters
                                  </h2>
                                  {hasActive && (
                                      <button
                                          onClick={clear}
                                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800/50 hover:bg-gray-700 text-white hover:text-red-400 border border-gray-700 hover:border-red-400/50 rounded-full text-xs font-medium transition-all duration-200">
                                          <X className="w-3 h-3" />
                                          Clear
                                      </button>
                                  )}
                              </div>
                              <button
                                  ref={firstFocusRef}
                                  onClick={onClose}
                                  aria-label="Close filters"
                                  className="p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/60">
                                  <X className="w-5 h-5" />
                              </button>
                          </div>
                          <div
                              className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                              style={{ WebkitOverflowScrolling: 'touch' }}>
                              <div className="space-y-3 pb-6">
                                  {sections.map((sec) => (
                                      <Section
                                          key={sec.key}
                                          id={sec.key}
                                          label={sec.label}
                                          expanded={open[sec.key]}
                                          onToggle={toggle}>
                                          <ul className="flex flex-col gap-2">
                                              {sec.items.map((it) => (
                                                  <li key={it.id}>
                                                      <OptionButton
                                                          active={it.active}
                                                          onClick={it.onClick}
                                                          label={it.name}
                                                      />
                                                  </li>
                                              ))}
                                          </ul>
                                      </Section>
                                  ))}
                                  <Section
                                      id="price"
                                      label="Price"
                                      expanded={open.price}
                                      onToggle={toggle}>
                                      <div className="space-y-3">
                                          <div className="flex items-center gap-3">
                                              <PriceInput
                                                  aria-label="Minimum price"
                                                  value={filters.priceRange?.[0] ?? 0}
                                                  min={0}
                                                  max={filters.priceRange?.[1] ?? 1000}
                                                  onChange={(v) => update({ priceRange: [v, filters.priceRange?.[1] ?? 1000] })}
                                              />
                                              <span className="text-gray-500">–</span>
                                              <PriceInput
                                                  aria-label="Maximum price"
                                                  value={filters.priceRange?.[1] ?? 1000}
                                                  min={filters.priceRange?.[0] ?? 0}
                                                  max={1000}
                                                  onChange={(v) => update({ priceRange: [filters.priceRange?.[0] ?? 0, v] })}
                                              />
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                              <QuickPrice
                                                  label="Free"
                                                  active={filters.priceRange?.[0] === 0 && filters.priceRange?.[1] === 0}
                                                  onClick={() => update({ priceRange: [0, 0] })}
                                              />
                                              <QuickPrice
                                                  label="Under $20"
                                                  active={filters.priceRange?.[0] === 1 && filters.priceRange?.[1] === 20}
                                                  onClick={() => update({ priceRange: [1, 20] })}
                                              />
                                              <QuickPrice
                                                  label="$20 - $50"
                                                  active={filters.priceRange?.[0] === 20 && filters.priceRange?.[1] === 50}
                                                  onClick={() => update({ priceRange: [20, 50] })}
                                              />
                                              <QuickPrice
                                                  label="Over $50"
                                                  active={filters.priceRange?.[0] === 50 && filters.priceRange?.[1] === 1000}
                                                  onClick={() => update({ priceRange: [50, 1000] })}
                                              />
                                          </div>
                                      </div>
                                  </Section>
                                  <Section
                                      id="rating"
                                      label="Rating"
                                      expanded={open.rating}
                                      onToggle={toggle}>
                                      <div className="flex flex-col gap-2">
                                          {[4, 3, 2, 1, 0].map((r) => (
                                              <RatingButton
                                                  key={r}
                                                  rating={r}
                                                  active={filters.rating === r}
                                                  onClick={() => update({ rating: r })}
                                              />
                                          ))}
                                      </div>
                                  </Section>
                                  <Section
                                      id="seller"
                                      label="Seller"
                                      expanded={open.seller}
                                      onToggle={toggle}>
                                      <label className="flex items-center gap-3 p-3 rounded-md bg-gray-900/40 hover:bg-gray-800/60 cursor-pointer">
                                          <input
                                              type="checkbox"
                                              checked={filters.verifiedOnly}
                                              onChange={(e) => update({ verifiedOnly: e.target.checked })}
                                              className="h-4 w-4 rounded border-gray-600 text-emerald-400 focus:ring-emerald-500"
                                              aria-label="Verified sellers only"
                                          />
                                          <span className="text-sm">Verified sellers only</span>
                                      </label>
                                  </Section>
                              </div>
                          </div>
                          <div className="px-5 py-4 flex gap-3 border-t border-gray-800/70 bg-[#111214] shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                              <button
                                  ref={lastFocusRef}
                                  onClick={onClose}
                                  className="flex-1 h-11 rounded-lg bg-emerald-400 text-black text-sm font-semibold hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111214] focus:ring-emerald-400">
                                  Apply
                              </button>
                          </div>
                      </motion.div>
                  </>
              </AnimatePresence>,
              document.body
          )
        : null
}
function Section({ id, label, children, expanded, onToggle }) {
    return (
        <div className="border border-gray-800/60 rounded-lg overflow-hidden">
            <button
                onClick={() => onToggle(id)}
                aria-expanded={expanded}
                aria-controls={`sec-${id}`}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/40 hover:bg-gray-800/60 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                <span className="text-sm font-medium tracking-wide">{label}</span>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <motion.div
                id={`sec-${id}`}
                initial={false}
                animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden">
                {expanded && <div className="px-4 pt-2 pb-4 space-y-2">{children}</div>}
            </motion.div>
        </div>
    )
}
function OptionButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                active ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-900/30 border-transparent hover:bg-gray-800/50 text-gray-300'
            }`}>
            <span className="truncate">{label}</span>
            {active && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>
    )
}
function RatingButton({ rating, active, onClick }) {
    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            aria-label={rating === 0 ? 'All ratings' : `${rating} stars & up`}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                active ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-900/30 border-transparent hover:bg-gray-800/50 text-gray-300'
            }`}>
            {rating === 0 ? (
                <span>All ratings</span>
            ) : (
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                    ))}
                    <span className="text-xs text-gray-500">& up</span>
                </div>
            )}
            {active && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />}
        </button>
    )
}
function PriceInput({ value, onChange, min, max, ...rest }) {
    return (
        <div className="flex-1 relative">
            <DollarSign className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                onChange={(e) => {
                    const raw = parseInt(e.target.value) || 0
                    onChange(Math.min(max, Math.max(min, raw)))
                }}
                className="w-full pl-8 pr-2 py-2 bg-gray-900/40 border border-gray-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                {...rest}
            />
        </div>
    )
}
function QuickPrice({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-2.5 py-2 rounded-md text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                active
                    ? 'bg-emerald-400/20 border-emerald-400/40 text-emerald-300'
                    : 'bg-gray-900/30 border-transparent hover:bg-gray-800/50 text-gray-300'
            }`}>
            {label}
        </button>
    )
}
