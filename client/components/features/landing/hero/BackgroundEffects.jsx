'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

function BackgroundEffects() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Memoize mouse handler to prevent unnecessary re-renders
  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      try {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      } catch (error) {
        console.warn('Canvas resize failed:', error)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize enhanced particles with error handling
    const initParticles = () => {
      try {
        const particleCount = Math.min(100, Math.floor(window.innerWidth / 15)) // Reduced for better performance
        particlesRef.current = []

        for (let i = 0; i < particleCount; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.6 + 0.2,
            color: `hsla(${Math.random() * 60 + 200}, 70%, 60%, ${Math.random() * 0.4 + 0.2})`,
            pulseSpeed: Math.random() * 0.01 + 0.005,
            pulsePhase: Math.random() * Math.PI * 2,
            trail: [],
            type: Math.random() > 0.8 ? 'glow' : 'normal'
          })
        }
      } catch (error) {
        console.warn('Particle initialization failed:', error)
      }
    }

    initParticles()
    window.addEventListener('mousemove', handleMouseMove)

    // Enhanced animation loop with error handling and performance optimization
    const animate = (time) => {
      try {
        if (!ctx || !canvas) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Remove the blue background gradient - keep canvas transparent
        // No background gradient applied to keep it transparent

        particlesRef.current.forEach((particle, index) => {
          // Update position with mouse interaction
          const mouseDistance = Math.sqrt(
            Math.pow(mousePosition.x - particle.x, 2) + 
            Math.pow(mousePosition.y - particle.y, 2)
          )
          
          if (mouseDistance < 80) {
            const force = (80 - mouseDistance) / 80
            const angle = Math.atan2(particle.y - mousePosition.y, particle.x - mousePosition.x)
            particle.vx += Math.cos(angle) * force * 0.005
            particle.vy += Math.sin(angle) * force * 0.005
          }

          // Update particle position
          particle.x += particle.vx
          particle.y += particle.vy

          // Boundary wrapping
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0

          // Add velocity dampening
          particle.vx *= 0.995
          particle.vy *= 0.995

          // Update trail (reduced length for performance)
          if (particle.trail.length > 3) {
            particle.trail.shift()
          }
          particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity })

          // Pulsing effect
          const pulseSize = particle.size + Math.sin(time * particle.pulseSpeed + particle.pulsePhase) * 0.3

          // Draw trail
          particle.trail.forEach((trailPoint, trailIndex) => {
            const trailOpacity = (trailIndex / particle.trail.length) * trailPoint.opacity * 0.2
            ctx.globalAlpha = trailOpacity
            ctx.fillStyle = particle.color
            ctx.beginPath()
            ctx.arc(trailPoint.x, trailPoint.y, particle.size * 0.2, 0, Math.PI * 2)
            ctx.fill()
          })

          // Draw main particle
          ctx.globalAlpha = particle.opacity

          if (particle.type === 'glow') {
            // Glowing effect - using green tones instead of blue
            const gradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, pulseSize * 2
            )
            gradient.addColorStop(0, 'rgba(0, 255, 137, 0.3)')
            gradient.addColorStop(0.5, 'rgba(0, 255, 137, 0.05)')
            gradient.addColorStop(1, 'transparent')
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, pulseSize * 2, 0, Math.PI * 2)
            ctx.fill()
          }

          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2)
          ctx.fill()

          // Connect nearby particles (reduced distance for performance) - using green instead of blue
          particlesRef.current.slice(index + 1).forEach(otherParticle => {
            const distance = Math.sqrt(
              Math.pow(particle.x - otherParticle.x, 2) + 
              Math.pow(particle.y - otherParticle.y, 2)
            )

            if (distance < 80) {
              const lineOpacity = (80 - distance) / 80 * 0.2
              ctx.globalAlpha = lineOpacity
              ctx.strokeStyle = `rgba(0, 255, 137, ${lineOpacity})`
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.stroke()
            }
          })
        })

        ctx.globalAlpha = 1
        animationRef.current = requestAnimationFrame(animate)
      } catch (error) {
        console.warn('Animation frame error:', error)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isClient, mousePosition, handleMouseMove])

  if (!isClient) {
    return null // Don't render anything on server side
  }

  // Fixed size classes for Tailwind compatibility
  const shapeClasses = ['w-8 h-8', 'w-12 h-12', 'w-16 h-16', 'w-20 h-20', 'w-24 h-24']
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Remove all gradient overlays - keep background completely transparent */}
      
      {/* Animated canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 mix-blend-screen opacity-10"
        style={{ willChange: 'auto' }}
      />

      {/* Floating geometric shapes with fixed classes - reduced opacity */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + (i * 15) % 60}%`,
              top: `${20 + (i * 20) % 60}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div
              className={`${shapeClasses[i % shapeClasses.length]} border border-gray-200/5 rounded-full blur-sm opacity-5`}
              style={{
                background: `transparent`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Remove all light beams to eliminate blue tints */}
    </div>
  )
}

export { BackgroundEffects }
export default BackgroundEffects