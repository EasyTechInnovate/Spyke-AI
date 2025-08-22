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
        
        // Add subtle background gradient
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
        )
        gradient.addColorStop(0, 'rgba(0, 15, 30, 0.1)')
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

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
            // Glowing effect
            const gradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, pulseSize * 2
            )
            gradient.addColorStop(0, particle.color)
            gradient.addColorStop(0.5, particle.color.replace(/[\d\.]+\)$/g, '0.05)'))
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

          // Connect nearby particles (reduced distance for performance)
          particlesRef.current.slice(index + 1).forEach(otherParticle => {
            const distance = Math.sqrt(
              Math.pow(particle.x - otherParticle.x, 2) + 
              Math.pow(particle.y - otherParticle.y, 2)
            )

            if (distance < 80) {
              const lineOpacity = (80 - distance) / 80 * 0.2
              ctx.globalAlpha = lineOpacity
              ctx.strokeStyle = `rgba(100, 200, 255, ${lineOpacity})`
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
      {/* Enhanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-brand-primary/3 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-purple-500/2 to-transparent" />
      
      {/* Animated canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 mix-blend-screen opacity-60"
        style={{ willChange: 'auto' }}
      />

      {/* Floating geometric shapes with fixed classes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
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
              className={`${shapeClasses[i % shapeClasses.length]} border border-brand-primary/8 rounded-full blur-sm opacity-40`}
              style={{
                background: `linear-gradient(45deg, transparent, rgba(100, 200, 255, 0.05))`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Enhanced light beams */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-brand-primary/15 via-transparent to-transparent transform -rotate-12 opacity-50"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scaleY: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-purple-400/10 via-transparent to-transparent transform rotate-12 opacity-50"
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scaleY: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Pulsing orbs with fixed positioning */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-xl opacity-30"
            style={{
              left: `${25 + i * 25}%`,
              top: `${30 + i * 15}%`,
              width: '150px',
              height: '150px',
              background: `radial-gradient(circle, rgba(100, 200, 255, 0.08) 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, 15, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 3
            }}
          />
        ))}
      </div>
    </div>
  )
}

export { BackgroundEffects }
export default BackgroundEffects