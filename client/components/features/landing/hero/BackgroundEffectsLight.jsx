'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function BackgroundEffectsLight() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Respect user's reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Generate elegant floating particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }))

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Seamless base gradient that covers the entire viewport */}
      <div className="absolute inset-0">
        {/* Primary dark base */}
        <div className="absolute inset-0 bg-black" />

        {/* Smooth vertical gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/10 via-black to-gray-900/15" />

        {/* Continuous radial gradients that span multiple sections */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: `
              radial-gradient(ellipse 800px 400px at 20% 20%, rgba(0, 255, 137, 0.12) 0%, rgba(0, 255, 137, 0.04) 40%, transparent 70%),
              radial-gradient(ellipse 600px 300px at 80% 80%, rgba(0, 255, 137, 0.08) 0%, rgba(0, 255, 137, 0.02) 50%, transparent 80%),
              radial-gradient(ellipse 1000px 500px at 50% 50%, rgba(0, 255, 137, 0.06) 0%, transparent 60%)
            `
          }}
        />

        {/* Additional flowing gradients for seamless transitions */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background: `
              linear-gradient(135deg, rgba(0, 255, 137, 0.05) 0%, transparent 30%, rgba(0, 255, 137, 0.03) 60%, transparent 100%),
              linear-gradient(-45deg, transparent 0%, rgba(0, 255, 137, 0.04) 40%, transparent 80%)
            `
          }}
        />
      </div>

      {/* Large animated glow orbs that span across sections */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
        style={{
          top: '15%',
          right: '15%',
          background: `radial-gradient(circle, rgba(0, 255, 137, 0.12) 0%, rgba(0, 255, 137, 0.06) 40%, transparent 70%)`
        }}
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.2, 1.1, 1],
          opacity: [0.4, 0.8, 0.6, 0.4],
          x: [0, -30, 20, 0],
          y: [0, 25, -15, 0],
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 35,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
        style={{
          bottom: '10%',
          left: '20%',
          background: `radial-gradient(circle, rgba(0, 255, 137, 0.10) 0%, rgba(0, 255, 137, 0.05) 50%, transparent 70%)`
        }}
        animate={prefersReducedMotion ? {} : {
          scale: [1.1, 1, 1.3, 1.1],
          opacity: [0.3, 0.7, 0.4, 0.3],
          x: [0, 40, -25, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 40,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />

      {/* Central flowing glow */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-2xl"
        style={{
          top: '40%',
          left: '45%',
          background: `radial-gradient(circle, rgba(0, 255, 137, 0.08) 0%, rgba(0, 255, 137, 0.03) 60%, transparent 80%)`
        }}
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: prefersReducedMotion ? 0 : 25,
          repeat: prefersReducedMotion ? 0 : Infinity,
          ease: "easeInOut",
          delay: 8
        }}
      />

      {/* Distributed floating particles across the entire page */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full blur-sm"
              style={{
                left: `${particle.initialX}%`,
                top: `${particle.initialY}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `rgba(0, 255, 137, 0.5)`,
                boxShadow: `0 0 ${particle.size * 3}px rgba(0, 255, 137, 0.2)`,
              }}
              animate={{
                y: [-50, -150, -50],
                x: [-25, 30, -25],
                opacity: [0, 1, 0],
                scale: [0.3, 1.2, 0.3],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Seamless geometric grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 137, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 137, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Flowing geometric elements */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {/* Large flowing ring */}
          <motion.div
            className="absolute w-60 h-60 border-2 rounded-full"
            style={{
              top: '25%',
              right: '20%',
              borderColor: 'rgba(0, 255, 137, 0.15)',
              boxShadow: '0 0 30px rgba(0, 255, 137, 0.08)'
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 45,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Medium flowing ring */}
          <motion.div
            className="absolute w-32 h-32 border rounded-full"
            style={{
              bottom: '30%',
              left: '65%',
              borderColor: 'rgba(0, 255, 137, 0.2)',
              boxShadow: '0 0 20px rgba(0, 255, 137, 0.08)'
            }}
            animate={{
              rotate: [360, 0],
              scale: [1, 1.12, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Distributed accent dots */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${10 + (i * 12)}%`,
                top: `${20 + (i * 9)}%`,
                background: 'rgba(0, 255, 137, 0.6)',
                boxShadow: '0 0 12px rgba(0, 255, 137, 0.4)',
              }}
              animate={{
                scale: [1, 2.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Flowing light streaks that connect sections visually */}
      <div className="absolute inset-0">
        <div
          className="absolute w-0.5 h-60 opacity-30"
          style={{
            top: '5%',
            left: '20%',
            background: `linear-gradient(to bottom, rgba(0, 255, 137, 0.6) 0%, rgba(0, 255, 137, 0.2) 50%, transparent 100%)`,
            transform: 'rotate(12deg)',
            boxShadow: '0 0 15px rgba(0, 255, 137, 0.2)'
          }}
        />
        <div
          className="absolute w-0.5 h-48 opacity-30"
          style={{
            bottom: '5%',
            right: '20%',
            background: `linear-gradient(to top, rgba(0, 255, 137, 0.5) 0%, rgba(0, 255, 137, 0.2) 50%, transparent 100%)`,
            transform: 'rotate(-15deg)',
            boxShadow: '0 0 12px rgba(0, 255, 137, 0.2)'
          }}
        />
        <div
          className="absolute w-0.5 h-40 opacity-25"
          style={{
            top: '50%',
            left: '70%',
            background: `linear-gradient(to bottom, transparent 0%, rgba(0, 255, 137, 0.4) 50%, transparent 100%)`,
            transform: 'rotate(8deg)',
            boxShadow: '0 0 10px rgba(0, 255, 137, 0.2)'
          }}
        />
      </div>

      {/* Enhanced seamless gradients for smooth section transitions */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent" />
      </div>
    </div>
  )
}