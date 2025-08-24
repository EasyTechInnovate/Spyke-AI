'use client'

import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info, Sparkles, Cpu, MessageSquare, HelpCircle } from 'lucide-react'

import { DESIGN_TOKENS, DSText } from '@/lib/design-system'
import { cn } from '@/lib/utils'

const tabsConfig = [
    { id: 'overview', label: 'Overview', icon: Info, description: 'Product details & benefits' },
    { id: 'features', label: 'Features', icon: Sparkles, description: 'Key capabilities' },
    { id: 'howitworks', label: 'How It Works', icon: Cpu, description: 'Step-by-step process' },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, description: 'Customer feedback' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Common questions' }
]

export default function ProductTabs({ 
    activeTab, 
    onTabChange, 
    product 
}) {
    const tabsBarRef = useRef(null)

    // Get counts for each tab
    const getTabCount = (tabId) => {
        switch (tabId) {
            case 'features':
                return product?.features?.length || 0
            case 'howitworks':
                return product?.howItWorks?.length || 0
            case 'reviews':
                return product?.totalReviews || 0
            case 'faq':
                return product?.faqs?.length || 0
            default:
                return null
        }
    }

    // Make tab bar sticky after scrolling past hero
    useEffect(() => {
        const el = tabsBarRef.current
        if (!el) return
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    el.classList.add('is-stuck')
                } else {
                    el.classList.remove('is-stuck')
                }
            },
            { root: null, threshold: 0 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    // Handle keyboard navigation for tabs
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.target.closest('[role="tablist"]')) {
                const tabIds = tabsConfig.map(tab => tab.id)
                const currentIndex = tabIds.indexOf(activeTab)
                
                switch (event.key) {
                    case 'ArrowLeft':
                        event.preventDefault()
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabIds.length - 1
                        onTabChange(tabIds[prevIndex])
                        break
                    case 'ArrowRight':
                        event.preventDefault()
                        const nextIndex = currentIndex < tabIds.length - 1 ? currentIndex + 1 : 0
                        onTabChange(tabIds[nextIndex])
                        break
                    case 'Home':
                        event.preventDefault()
                        onTabChange(tabIds[0])
                        break
                    case 'End':
                        event.preventDefault()
                        onTabChange(tabIds[tabIds.length - 1])
                        break
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [activeTab, onTabChange])

    return (
        <div className="mb-8">
            {/* Tab Statistics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div
                    className="text-center p-4 rounded-lg border"
                    style={{
                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                        borderColor: DESIGN_TOKENS.colors.background.elevated
                    }}>
                    <DSText
                        size="sm"
                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        Reviews
                    </DSText>
                    <DSText
                        size="xl"
                        className="font-bold"
                        style={{ color: DESIGN_TOKENS.colors.brand.primary }}>
                        {product?.totalReviews || 0}
                    </DSText>
                </div>
                <div
                    className="text-center p-4 rounded-lg border"
                    style={{
                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                        borderColor: DESIGN_TOKENS.colors.background.elevated
                    }}>
                    <DSText
                        size="sm"
                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        Features
                    </DSText>
                    <DSText
                        size="xl"
                        className="font-bold"
                        style={{ color: DESIGN_TOKENS.colors.brand.primary }}>
                        {product?.features?.length || 0}
                    </DSText>
                </div>
                <div
                    className="text-center p-4 rounded-lg border"
                    style={{
                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                        borderColor: DESIGN_TOKENS.colors.background.elevated
                    }}>
                    <DSText
                        size="sm"
                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        Steps
                    </DSText>
                    <DSText
                        size="xl"
                        className="font-bold"
                        style={{ color: DESIGN_TOKENS.colors.brand.primary }}>
                        {product?.howItWorks?.length || 0}
                    </DSText>
                </div>
                <div
                    className="text-center p-4 rounded-lg border"
                    style={{
                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                        borderColor: DESIGN_TOKENS.colors.background.elevated
                    }}>
                    <DSText
                        size="sm"
                        style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                        FAQs
                    </DSText>
                    <DSText
                        size="xl"
                        className="font-bold"
                        style={{ color: DESIGN_TOKENS.colors.brand.primary }}>
                        {product?.faqs?.length || 0}
                    </DSText>
                </div>
            </div>

            {/* Mobile: Dropdown selector */}
            <div className="sm:hidden mb-4">
                <select
                    value={activeTab}
                    onChange={(e) => onTabChange(e.target.value)}
                    className="w-full p-3 rounded-lg border text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{
                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                        borderColor: DESIGN_TOKENS.colors.background.elevated,
                        color: DESIGN_TOKENS.colors.text.primary.dark
                    }}
                    aria-label="Select product info section">
                    {tabsConfig.map(tab => {
                        const count = getTabCount(tab.id)
                        return (
                            <option key={tab.id} value={tab.id} style={{ backgroundColor: DESIGN_TOKENS.colors.background.card.dark }}>
                                {tab.label}{count !== null && count > 0 ? ` (${count})` : ''}
                            </option>
                        )
                    })}
                </select>
            </div>

            {/* Desktop: Enhanced segmented tablist */}
            <div className="hidden sm:block">
                <div
                    ref={tabsBarRef}
                    role="tablist"
                    aria-label="Product detail sections"
                    aria-orientation="horizontal"
                    className={cn(
                        'group relative flex items-stretch gap-1 px-2 py-2 rounded-3xl border overflow-x-auto no-scrollbar backdrop-blur-xl will-change-transform transition-colors',
                        'before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:border before:opacity-40',
                        'shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)_inset]',
                        'is-stuck:fixed is-stuck:top-4 is-stuck:left-4 is-stuck:right-4 is-stuck:z-40 is-stuck:mx-auto is-stuck:max-w-4xl'
                    )}
                    style={{
                        background: `linear-gradient(145deg, ${DESIGN_TOKENS.colors.background.card.dark}e6 0%, ${DESIGN_TOKENS.colors.background.card.dark}cc 60%, ${DESIGN_TOKENS.colors.background.card.dark}b3 100%)`,
                        borderColor: DESIGN_TOKENS.colors.background.elevated
                    }}>
                    {tabsConfig.map(tab => {
                        const active = activeTab === tab.id
                        const count = getTabCount(tab.id)
                        
                        return (
                            <button
                                key={tab.id}
                                role="tab"
                                id={`tab-${tab.id}`}
                                aria-selected={active}
                                aria-controls={`panel-${tab.id}`}
                                aria-describedby={`desc-${tab.id}`}
                                tabIndex={active ? 0 : -1}
                                onClick={() => onTabChange(tab.id)}
                                className={cn(
                                    'relative isolate flex flex-col justify-center px-5 py-3 rounded-2xl min-w-[132px] focus:outline-none text-sm transition-colors font-medium',
                                    'hover:text-white/90 focus:ring-2 focus:ring-offset-2',
                                    active ? 'text-black' : 'text-gray-400'
                                )}
                                style={{ 
                                    fontFamily: DESIGN_TOKENS.typography.fontFamily.body,
                                    focusRingColor: DESIGN_TOKENS.colors.brand.primary + '50'
                                }}>
                                {active && (
                                    <motion.div
                                        layoutId="tabHighlight"
                                        className="absolute inset-0 rounded-2xl"
                                        style={{
                                            background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.brand.primary}, ${DESIGN_TOKENS.colors.brand.secondary})`,
                                            boxShadow: `0 6px 18px -6px ${DESIGN_TOKENS.colors.brand.primary}80`
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                                <div className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
                                    <tab.icon className={cn('w-4 h-4 transition-opacity', active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100')} />
                                    <span>{tab.label}</span>
                                    {count !== null && count > 0 && (
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-md transition-all',
                                                active
                                                    ? 'bg-black/30 text-black/80 border-black/20'
                                                    : 'bg-white/5 text-gray-300 border-white/10 group-hover:bg-white/10'
                                            )}>
                                            {count}
                                        </span>
                                    )}
                                </div>
                                {/* Hidden description for screen readers */}
                                <span id={`desc-${tab.id}`} className="sr-only">
                                    {tab.description}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}