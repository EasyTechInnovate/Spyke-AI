'use client'
import { motion } from 'framer-motion'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const BackgroundEffectsLight = dynamic(() => import('./hero/BackgroundEffectsLight'), {
  ssr: false,
  loading: () => null
})
const blogHighlights = [
  {
    id: 'ai-automation-trends-2025',
    title: 'The Future of AI Automation: Top 10 Trends Shaping 2025',
    excerpt: 'Discover the revolutionary AI automation trends that will transform businesses and reshape industries.',
    author: {
      name: 'Sarah Chen'
    },
    date: 'Dec 15, 2024',
    readTime: '8 min read'
  },
  {
    id: 'chatgpt-prompt-engineering',
    title: 'Master ChatGPT: Advanced Prompt Engineering Techniques',
    excerpt: 'Learn professional prompt engineering strategies to unlock ChatGPT\'s full potential.',
    author: {
      name: 'Marcus Rodriguez'
    },
    date: 'Dec 12, 2024',
    readTime: '12 min read'
  },
  {
    id: 'no-code-automation-tools',
    title: 'No-Code Automation: Building Workflows Without Programming',
    excerpt: 'Explore powerful no-code tools and platforms that enable anyone to create workflows.',
    author: {
      name: 'Elena Vasquez'
    },
    date: 'Dec 10, 2024',
    readTime: '6 min read'
  }
]
export default function BlogHighlights() {
  return (
    <section className="relative py-20 lg:py-24 bg-black">
      <BackgroundEffectsLight />
      <Container>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">
              Latest Insights & Tutorials
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
              Stay ahead with expert tips, tutorials, and industry insights
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogHighlights.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/blog/${post.id}`} className="block h-full">
                  <div className="relative h-full bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-brand-primary/30 transition-all duration-300 hover:bg-gray-900/70">
                    <h3 className="font-league-spartan font-bold text-xl mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-brand-primary">
                            {post.author.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{post.author.name}</p>
                          <p className="text-xs text-gray-500">{post.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{post.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-brand-primary group-hover:text-brand-primary/80 transition-colors">
                      <span className="text-sm font-medium">Read more</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-black font-semibold rounded-lg hover:bg-[#00FF89]/90 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF89]/25 group"
            >
              View All Articles
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}