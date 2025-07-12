import { useState, useEffect } from 'react'

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1536
}

export function useResponsive() {
  const [dimensions, setDimensions] = useState({ 
    width: 0, 
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        const width = window.innerWidth
        const height = window.innerHeight
        
        setDimensions({
          width,
          height,
          isMobile: width < BREAKPOINTS.mobile,
          isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop,
          isDesktop: width >= BREAKPOINTS.desktop
        })
      }

      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  return dimensions
}