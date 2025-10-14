'use client'
import { useEffect, useState, useRef } from 'react'

export default function HeroAccessibility({ children }) {
  const [announceContent, setAnnounceContent] = useState('')
  const [isHighContrast, setIsHighContrast] = useState(false)
  const skipLinkRef = useRef(null)
  const mainRef = useRef(null)

  useEffect(() => {
    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(contrastQuery.matches)
    const handleContrastChange = (e) => setIsHighContrast(e.matches)
    contrastQuery.addEventListener('change', handleContrastChange)

    // Announce content load with better timing
    const timer = setTimeout(() => {
      setAnnounceContent('SpykeAI marketplace loaded. Use Tab to navigate or press the skip link to go directly to search.')
    }, 100) // Reduced delay for faster announcement

    // Set page title for screen readers
    document.title = 'SpykeAI - AI Marketplace | Discover 10,000+ AI Prompts & Automation Tools'

    return () => {
      contrastQuery.removeEventListener('change', handleContrastChange)
      clearTimeout(timer)
    }
  }, [])

  const handleSkipToSearch = (e) => {
    e.preventDefault()
    const searchInput = document.querySelector('#main-search input')
    if (searchInput) {
      searchInput.focus()
      setAnnounceContent('Moved to search input. Type to search AI prompts and tools.')
    }
  }

  return (
    <div className={isHighContrast ? 'high-contrast' : ''}>
      {/* Enhanced skip navigation */}
      <a
        ref={skipLinkRef}
        href="#main-search"
        onClick={handleSkipToSearch}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] px-6 py-3 bg-[#00FF89] text-black font-bold rounded-lg shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
        onFocus={() => setAnnounceContent('Skip navigation focused. Press Enter to jump to main search input.')}
      >
        Skip to main search
      </a>

      {/* Screen reader announcements */}
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
        aria-label="Page status updates"
      >
        {announceContent}
      </div>

      {/* Navigation instructions for screen readers */}
      <div className="sr-only" role="region" aria-label="Navigation instructions">
        <h2>Navigation Instructions</h2>
        <p>
          This page contains a search interface for AI prompts and automation tools. 
          Use Tab to navigate between elements. Main interactive elements include: 
          Search input field, trending topic buttons, Explore Marketplace button, and Start Selling button.
        </p>
        <p>
          The page displays statistics showing 10,000+ AI Prompts, 5,000+ Active Creators, and 50,000+ Happy Customers.
        </p>
      </div>

      {/* Landmark navigation for screen readers */}
      <nav className="sr-only" role="navigation" aria-label="Page sections">
        <h2>Page Sections</h2>
        <ul>
          <li><a href="#main-search">Search Interface</a></li>
          <li><a href="#platform-stats">Platform Statistics</a></li>
          <li><a href="#featured-products">Featured Products</a></li>
          <li><a href="#featured-collections">Collections</a></li>
        </ul>
      </nav>

      {/* Main content with proper semantics */}
      <main 
        ref={mainRef}
        role="main" 
        className="focus:outline-none" 
        tabIndex="-1"
        aria-label="SpykeAI marketplace main content"
      >
        {children}
      </main>

      {/* Enhanced high contrast styles */}
      <style jsx>{`
        .high-contrast h1,
        .high-contrast h2,
        .high-contrast h3,
        .high-contrast h4,
        .high-contrast h5,
        .high-contrast h6 {
          color: white !important;
          text-shadow: 2px 2px 4px black !important;
        }
        
        .high-contrast p,
        .high-contrast span,
        .high-contrast div {
          color: white !important;
        }
        
        .high-contrast button,
        .high-contrast a[role="button"],
        .high-contrast input[type="submit"] {
          border: 3px solid white !important;
          background: contrast !important;
        }
        
        .high-contrast input,
        .high-contrast textarea {
          border: 2px solid white !important;
          background: black !important;
          color: white !important;
        }
        
        .high-contrast .bg-\\[\\#00FF89\\]\\/5,
        .high-contrast .bg-\\[\\#00FF89\\]\\/10 {
          background-color: rgba(0, 255, 137, 0.3) !important;
          border: 2px solid white !important;
        }

        .high-contrast .text-white\\/90,
        .high-contrast .text-white\\/70 {
          color: white !important;
        }

        /* Focus indicators */
        .high-contrast *:focus {
          outline: 3px solid #00FF89 !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>
  )
}