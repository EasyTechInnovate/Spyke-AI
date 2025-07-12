import { motion } from 'framer-motion'
import { useResponsive } from '@/hooks/useResponsive'

export default function PopularTags({ tags, onTagClick }) {
  const { isMobile } = useResponsive()
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4"
    >
      <span className="text-gray-400 text-xs sm:text-sm">Popular:</span>
      {tags.map((tag, i) => (
        <motion.button
          key={tag}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: 1.1 + i * 0.1,
            type: "spring",
            stiffness: 200
          }}
          whileHover={!isMobile ? { 
            scale: 1.05,
            boxShadow: "0 0 20px rgba(0,255,137,0.5)"
          } : {}}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTagClick(tag)}
          className="relative px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full overflow-hidden group"
          aria-label={`Search for ${tag}`}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/20 to-brand-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="relative z-10 block px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:text-brand-primary transition-colors duration-200">
            {tag}
          </span>
        </motion.button>
      ))}
    </motion.div>
  )
}