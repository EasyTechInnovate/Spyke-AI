'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProductCarousel({ children, autoPlay = true, interval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const items = Array.isArray(children) ? children : [children]
  const itemCount = items.length

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % itemCount)
  }, [itemCount])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + itemCount) % itemCount)
  }, [itemCount])

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index)
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered || itemCount <= 1) return

    const timer = setInterval(goToNext, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, isHovered, goToNext, itemCount])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  if (itemCount === 0) return null

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main carousel container */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={currentIndex}>
          <motion.div
            key={currentIndex}
            custom={currentIndex}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: "tween",
              ease: "easeInOut",
              duration: 0.5
            }}
            className="w-full"
          >
            {items[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {itemCount > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full",
              "text-white hover:bg-black/70 transition-all duration-200",
              "opacity-0 group-hover:opacity-100 focus:opacity-100",
              "hover:scale-110 active:scale-95"
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full",
              "text-white hover:bg-black/70 transition-all duration-200",
              "opacity-0 group-hover:opacity-100 focus:opacity-100",
              "hover:scale-110 active:scale-95"
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {itemCount > 1 && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "transition-all duration-300",
                currentIndex === index
                  ? "w-8 h-2 bg-brand-primary rounded-full"
                  : "w-2 h-2 bg-gray-600 rounded-full hover:bg-gray-500"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}