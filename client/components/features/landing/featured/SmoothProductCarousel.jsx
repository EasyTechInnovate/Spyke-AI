'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SmoothProductCarousel({ 
  children, 
  autoPlay = true, 
  interval = 4000,
  slidesToShow = 4,
  slidesToScroll = 1,
  gap = 24,
  responsive = [
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 1 } }
  ]
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [visibleSlides, setVisibleSlides] = useState(slidesToShow)
  const containerRef = useRef(null)
  const controls = useAnimation()
  
  const items = Array.isArray(children) ? children : [children]
  const totalItems = items.length

  // Handle responsive slides
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      let slides = slidesToShow
      
      responsive.forEach(({ breakpoint, settings }) => {
        if (width <= breakpoint) {
          slides = settings.slidesToShow
        }
      })
      
      setVisibleSlides(slides)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [slidesToShow, responsive])

  // Calculate slide width
  const slideWidth = 100 / visibleSlides
  const maxIndex = Math.max(0, totalItems - visibleSlides)

  const goToNext = async () => {
    const nextIndex = Math.min(currentIndex + slidesToScroll, maxIndex)
    setCurrentIndex(nextIndex)
    await controls.start({
      x: `-${nextIndex * slideWidth}%`,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    })
  }

  const goToPrevious = async () => {
    const prevIndex = Math.max(currentIndex - slidesToScroll, 0)
    setCurrentIndex(prevIndex)
    await controls.start({
      x: `-${prevIndex * slideWidth}%`,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    })
  }

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isHovered || totalItems <= visibleSlides) return

    const timer = setInterval(() => {
      if (currentIndex >= maxIndex) {
        setCurrentIndex(0)
        controls.start({
          x: '0%',
          transition: { type: "spring", stiffness: 300, damping: 30 }
        })
      } else {
        goToNext()
      }
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, isHovered, currentIndex, maxIndex, controls, visibleSlides, totalItems])

  const canGoNext = currentIndex < maxIndex
  const canGoPrevious = currentIndex > 0

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel viewport */}
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={controls}
          initial={{ x: 0 }}
          style={{ gap: `${gap}px` }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{ 
                flex: `0 0 calc(${slideWidth}% - ${gap * (visibleSlides - 1) / visibleSlides}px)` 
              }}
            >
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation buttons */}
      {totalItems > visibleSlides && (
        <>
          <button
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10",
              "p-3 bg-black/70 backdrop-blur-sm rounded-full",
              "text-white transition-all duration-200",
              "hover:bg-black/90 hover:scale-110",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "shadow-lg shadow-black/20"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            disabled={!canGoNext}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10",
              "p-3 bg-black/70 backdrop-blur-sm rounded-full",
              "text-white transition-all duration-200",
              "hover:bg-black/90 hover:scale-110",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "shadow-lg shadow-black/20"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {totalItems > visibleSlides && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(totalItems / slidesToScroll) }).map((_, index) => {
            const dotIndex = index * slidesToScroll
            const isActive = currentIndex >= dotIndex && currentIndex < dotIndex + slidesToScroll
            
            return (
              <button
                key={index}
                onClick={() => {
                  const targetIndex = Math.min(dotIndex, maxIndex)
                  setCurrentIndex(targetIndex)
                  controls.start({
                    x: `-${targetIndex * slideWidth}%`,
                    transition: { type: "spring", stiffness: 300, damping: 30 }
                  })
                }}
                className={cn(
                  "transition-all duration-300",
                  isActive
                    ? "w-8 h-2 bg-brand-primary rounded-full"
                    : "w-2 h-2 bg-gray-600 rounded-full hover:bg-gray-500"
                )}
                aria-label={`Go to slide group ${index + 1}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}