'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function HeroAccessibility({ children }) {
  const [announceContent, setAnnounceContent] = useState('')
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(contrastQuery.matches)
    
    const handleContrastChange = (e) => setIsHighContrast(e.matches)
    contrastQuery.addEventListener('change', handleContrastChange)

    // Announce when hero content is loaded
    const timer = setTimeout(() => {
      setAnnounceContent('AI marketplace hero section loaded. Search for prompts and tools using the search bar below.')
    }, 500)

    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className={isHighContrast ? 'high-contrast' : ''}>
      {/* Skip Navigation */}
      <a
        href="#main-search"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 px-4 py-2 bg-[#00FF89] text-[#121212] font-bold rounded-md shadow-lg transition-all duration-200"
        onFocus={() => setAnnounceContent('Skip navigation focused. Press Enter to jump to main search.')}
      >
        Skip to main search
      </a>

      {/* Screen Reader Announcements */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {announceContent}
      </div>

      {/* Keyboard Navigation Helper */}
      <div className="sr-only">
        <p>
          Navigate this page using Tab key. Main interactive elements: Search bar, Explore button, Start Selling button.
        </p>
      </div>

      {/* Main Content with Landmarks */}
      <main role="main" className="focus:outline-none" tabIndex="-1">
        {children}
      </main>

      {/* High Contrast Styles */}
      <style jsx>{`
        .high-contrast h1 {
          color: white !important;
          text-shadow: 1px 1px 2px black;
        }
        
        .high-contrast p {
          color: white !important;
        }
        
        .high-contrast button,
        .high-contrast a[role="button"] {
          border: 2px solid white !important;
        }
        
        .high-contrast .bg-\\[\\#00FF89\\]\\/5 {
          background-color: rgba(0, 255, 137, 0.2) !important;
          border: 1px solid white !important;
        }
      `}</style>
    </div>
  )
}