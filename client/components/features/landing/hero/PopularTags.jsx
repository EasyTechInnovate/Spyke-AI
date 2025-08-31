import { motion } from 'framer-motion'
import { useResponsive } from '@/hooks/useResponsive'

export default function PopularTags({ tags, onTagClick }) {
  const { isMobile } = useResponsive()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex flex-wrap justify-center items-center gap-2 mt-4"
    >
      <span className="text-gray-500 text-sm">Popular:</span>
      {tags.map((tag, i) => (
        <motion.button
          key={tag}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.3,
            delay: 0.25 + i * 0.03
          }}
          whileHover={!isMobile ? {
            y: -2
          } : {}}
          whileTap={{ scale: 0.95 }}
          onClick={() => onTagClick(tag)}
          className="px-3 py-1.5 text-sm text-gray-400 bg-[#1f1f1f] border border-gray-800 hover:text-[#00FF89]/80 hover:bg-[#00FF89]/5 hover:border-[#00FF89]/20 rounded-full transition-all duration-200"
          aria-label={`Search for ${tag}`}
        >
          {tag}
        </motion.button>
      ))}
    </motion.div>
  )
}