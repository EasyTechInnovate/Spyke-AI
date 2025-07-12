import { useState, useRef, memo } from 'react'
import { motion } from 'framer-motion'
import { useResponsive } from '@/hooks/useResponsive'

const StatCard = memo(({ stat, index }) => {
  const Icon = stat.icon
  const cardRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const { isMobile } = useResponsive()
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: isMobile ? 30 : 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      className="relative group"
    >
      {/* Animated border gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-primary/50 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
      
      {/* Glow effect - only on desktop */}
      {!isMobile && (
        <motion.div
          className="absolute inset-0 bg-brand-primary/20 rounded-xl sm:rounded-2xl blur-xl"
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.3 : 0
          }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Card content */}
      <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 hover:border-brand-primary/50 transition-all duration-300">
        <motion.div
          animate={{ 
            rotate: isHovered && !isMobile ? [0, -10, 10, -10, 0] : 0,
            scale: isHovered && !isMobile ? 1.1 : 1
          }}
          transition={{ duration: 0.5 }}
        >
          <Icon
            className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-brand-primary mx-auto mb-1 sm:mb-2 md:mb-3 drop-shadow-[0_0_15px_rgba(0,255,137,0.5)]"
            aria-hidden="true"
          />
        </motion.div>
        <motion.div 
          className="font-bold text-lg sm:text-2xl md:text-4xl mb-0.5 sm:mb-1"
          animate={{ scale: isHovered && !isMobile ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {stat.value}
        </motion.div>
        <div className="text-xs sm:text-sm md:text-base text-gray-300">{stat.label}</div>
        
        {/* Floating dots animation - desktop only */}
        {isHovered && !isMobile && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-brand-primary rounded-full"
                initial={{ 
                  x: '50%', 
                  y: '50%',
                  scale: 0
                }}
                animate={{ 
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
})

StatCard.displayName = 'StatCard'
export default StatCard