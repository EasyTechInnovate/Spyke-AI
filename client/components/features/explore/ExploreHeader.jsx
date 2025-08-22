import { motion } from 'framer-motion'
import { DSStack, DSHeading, DSText, DSBadge } from '@/lib/design-system'
import { Search } from 'lucide-react'

export default function ExploreHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 sm:mb-12 text-center">
      
      <DSStack gap="medium" direction="column" align="center">
        <DSBadge variant="primary" icon={Search} className="mb-2">
          Discover & Explore
        </DSBadge>
        
        <DSHeading level={1} variant="hero">
          <span style={{ color: 'white' }}>Explore AI Products</span>
        </DSHeading>
        
        <DSText variant="subhero" style={{ color: '#9ca3af' }}>
          Discover the best AI tools, prompts, and templates from our community
        </DSText>
      </DSStack>
    </motion.div>
  )
}