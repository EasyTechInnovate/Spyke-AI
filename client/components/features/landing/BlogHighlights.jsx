'use client'

import { motion } from 'framer-motion'
import { BookOpen, Clock, ArrowRight, Tag } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'
import Image from 'next/image'

// Mock blog data - in production, this would come from API/CMS
const blogPosts = [
  {
    id: 1,
    title: '5 AI Tools You Should Try Today',
    excerpt: 'Discover the latest AI tools that can transform your workflow and boost productivity by 10x.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    author: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop'
    },
    readTime: '5 min read',
    date: 'Dec 15, 2024',
    category: 'AI Tools',
    tags: ['ChatGPT', 'Automation', 'Productivity']
  },
  {
    id: 2,
    title: 'Building Your First AI Agent: A Complete Guide',
    excerpt: 'Step-by-step tutorial on creating intelligent agents that can handle complex tasks autonomously.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop'
    },
    readTime: '8 min read',
    date: 'Dec 12, 2024',
    category: 'Tutorials',
    tags: ['AI Agents', 'Development', 'Guide']
  },
  {
    id: 3,
    title: 'The Future of Work: AI and Automation Trends',
    excerpt: 'Explore how AI is reshaping industries and what it means for professionals in 2025.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    author: {
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop'
    },
    readTime: '6 min read',
    date: 'Dec 10, 2024',
    category: 'Industry Insights',
    tags: ['Future of Work', 'AI Trends', 'Automation']
  }
]

export default function BlogHighlights() {
  return (
    <section className="relative py-20 lg:py-24 bg-black">
      <Container>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-500">
                From Our Blog
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">
              Latest Insights & Tutorials
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
              Stay ahead with expert tips, tutorials, and industry insights
            </p>
          </motion.div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/blog/${post.id}`}
                  className="group block h-full"
                >
                  <div className="relative h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10">
                    {/* Featured Image */}
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={600}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-xs font-medium bg-brand-primary text-brand-primary-text rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* Title */}
                      <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors font-title">
                        {post.title}
                      </h3>
                      
                      {/* Excerpt */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 font-body">
                        {post.excerpt}
                      </p>
                      
                      {/* Author & Meta */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {post.author.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {post.date}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{post.readTime}</span>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Read More */}
                      <div className="flex items-center text-brand-primary group-hover:text-brand-primary/80 transition-colors">
                        <span className="text-sm font-medium">Read more</span>
                        <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-gray-700 transition-all duration-200 group font-body"
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