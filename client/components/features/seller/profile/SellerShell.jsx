'use client'

import { ReactNode } from 'react'
import { theme } from '@/config/theme'

export default function SellerShell({ children, sidebar, header, className = '' }) {
  return (
    <div 
      className={`min-h-screen bg-[#121212] ${className}`}
      style={{
        '--bg-primary': theme.colors.background.dark,
        '--bg-surface': theme.colors.background.card.dark,
        '--text-primary': theme.colors.text.primary.dark,
        '--text-secondary': theme.colors.text.secondary.dark,
        '--brand-primary': theme.colors.brand.primary,
        '--brand-secondary': theme.colors.brand.secondary,
        '--brand-accent': theme.colors.brand.primaryText,
      }}
    >
      {/* Skip to main content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#00FF89] text-[#121212] px-4 py-2 rounded-lg z-50 transition-all"
      >
        Skip to main content
      </a>

      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40">
          {header}
        </header>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px] gap-6 p-4 lg:p-6 max-w-[2000px] mx-auto">
        {/* Left Sidebar - Identity & Navigation */}
        {sidebar && (
          <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main 
          id="main-content"
          className="min-w-0 space-y-6"
          role="main"
        >
          {children}
        </main>

        {/* Right Sidebar - Quick Actions & KPIs */}
        <aside className="hidden xl:block space-y-6 sticky top-24 h-fit">
          {/* This will be populated by page-specific components */}
        </aside>
      </div>
    </div>
  )
}