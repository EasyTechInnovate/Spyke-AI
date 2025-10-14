'use client'
import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'

export default function BackgroundEffectsLight() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)
      const handleChange = (e) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Simple green particles - no complex calculations
  const particles = useMemo(() => 
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: `${15 + (i * 15)}%`,
      y: `${20 + (i * 10)}%`,
      size: 2 + (i % 3),
      delay: i * 0.5
    })), []
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Simple green gradient background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(0, 255, 137, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0, 255, 137, 0.06) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(0, 255, 137, 0.04) 0%, transparent 70%)
          `
        }}
      />

      {/* Static green orbs for depth */}
      <div className="absolute top-1/4 right-1/5 w-80 h-80 rounded-full blur-3xl bg-[rgba(0,255,137,0.05)]" />
      <div className="absolute bottom-1/4 left-1/5 w-60 h-60 rounded-full blur-2xl bg-[rgba(0,255,137,0.03)]" />
      
      {/* Animated elements only if motion is allowed */}
      {!prefersReducedMotion && (
        <>
          {/* Gentle floating orb */}
          <motion.div
            className="absolute top-1/3 left-1/2 w-40 h-40 rounded-full blur-xl bg-[rgba(0,255,137,0.04)]"
            animate={{
              y: [-10, 10, -10],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Simple floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-[rgba(0,255,137,0.6)]"
              style={{
                left: particle.x,
                top: particle.y,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                boxShadow: `0 0 ${particle.size * 3}px rgba(0, 255, 137, 0.2)`
              }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Rotating ring */}
          <motion.div
            className="absolute top-1/4 right-1/4 w-32 h-32 border border-[rgba(0,255,137,0.1)] rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </>
      )}

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 137, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 137, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Edge gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
    </div>
  )
}