import { motion } from 'framer-motion'
import { useResponsive } from '@/hooks/useResponsive'

export default function AnimatedText({ text, className }) {
  const { isMobile } = useResponsive()
  
  if (isMobile) {
    return (
      <motion.div 
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {text}
      </motion.div>
    )
  }
  
  return (
    <motion.div className={className}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.02,
            ease: [0.215, 0.61, 0.355, 1]
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  )
}