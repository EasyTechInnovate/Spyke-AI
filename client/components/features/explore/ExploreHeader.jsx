import { motion } from 'framer-motion'

export default function ExploreHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h1 className="text-3xl lg:text-4xl font-bold mb-4">
        Explore AI Products
      </h1>
      <p className="text-gray-400 text-lg">
        Discover the best AI tools, prompts, and templates from our community
      </p>
    </motion.div>
  )
}