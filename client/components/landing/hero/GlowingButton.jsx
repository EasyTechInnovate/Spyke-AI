import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useResponsive } from '@/hooks/useResponsive'

export default function GlowingButton({ children, href, primary = false, onClick, className = "" }) {
  const [isHovered, setIsHovered] = useState(false)
  const { isMobile } = useResponsive()
  
  const ButtonContent = () => (
    <motion.div
      className="relative group"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      whileHover={!isMobile ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated background gradient */}
      <motion.div
        className={`absolute -inset-1 ${primary ? 'bg-gradient-to-r from-brand-primary via-green-400 to-brand-primary' : 'bg-gradient-to-r from-brand-primary/50 to-brand-primary/30'} rounded-xl sm:rounded-2xl blur-md sm:blur-lg opacity-60 group-hover:opacity-100`}
        animate={{
          backgroundPosition: isHovered && !isMobile ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%'
        }}
        transition={{
          backgroundPosition: {
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }
        }}
        style={{ backgroundSize: '200% 200%' }}
      />
      
      <div className={`relative ${className}`}>
        {children}
      </div>
    </motion.div>
  )
  
  if (href) {
    return <Link href={href}><ButtonContent /></Link>
  }
  
  return <button onClick={onClick}><ButtonContent /></button>
}