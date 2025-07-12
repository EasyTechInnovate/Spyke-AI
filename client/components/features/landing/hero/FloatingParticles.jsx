import { motion } from 'framer-motion'
import { useResponsive } from '@/hooks/useResponsive'

export default function FloatingParticles() {
  const { width, height, isMobile, isTablet } = useResponsive()
  
  const particleCount = isMobile ? 10 : isTablet ? 15 : 20
  
  if (width === 0) return null
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-brand-primary/30 rounded-full"
          initial={{
            x: Math.random() * width,
            y: Math.random() * height,
          }}
          animate={{
            x: Math.random() * width,
            y: Math.random() * height,
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            filter: 'blur(1px)',
            boxShadow: '0 0 10px rgba(0, 255, 137, 0.5)'
          }}
        />
      ))}
    </div>
  )
}
