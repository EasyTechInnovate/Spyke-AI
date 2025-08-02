'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, Calendar, User, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/shared/ui/button'
import { urlFor } from '@/sanity/lib/image'

export default function BlogListingPage() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    author: '',
    tag: '',
    sort: 'latest',
    search: '',
    page: 1,
    limit: 12
  })
  const [pagination, setPagination] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  // Fetch blog data
  useEffect(() => {
    fetchBlogData()
  }, [filters])

  useEffect(() => {
    fetchFilterOptions()
  }, [])

  const fetchBlogData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/blog/posts?${params}`)
      const data = await response.json()
      setPosts(data.posts || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const [categoriesRes, authorsRes, tagsRes] = await Promise.all([
        fetch('/api/blog/categories'),
        fetch('/api/blog/authors'),
        fetch('/api/blog/tags')
      ])

      const [categoriesData, authorsData, tagsData] = await Promise.all([
        categoriesRes.json(),
        authorsRes.json(),
        tagsRes.json()
      ])

      setCategories(categoriesData.categories || [])
      setAuthors(authorsData.authors || [])
      setTags(tagsData.tags || [])
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!filters.search.trim()) return
    
    try {
      const response = await fetch(`/api/blog/search?q=${encodeURIComponent(filters.search)}&limit=12`)
      const data = await response.json()
      setPosts(data.posts || [])
      setPagination({ current: 1, total: 1, count: data.count, totalPosts: data.count })
    } catch (error) {
      console.error('Error searching posts:', error)
    }
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      author: '',
      tag: '',
      sort: 'latest',
      search: '',
      page: 1,
      limit: 12
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      green: 'bg-green-500/10 text-green-400 border-green-500/20',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      red: 'bg-red-500/10 text-red-400 border-red-500/20',
      gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
    return colors[color] || colors.gray
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#121212]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Title */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-league-spartan font-bold text-gradient mb-2">
                AI Insights Blog
              </h1>
              <p className="text-gray-400 text-lg">
                Latest trends, tips, and success stories in AI automation
              </p>
            </div>

            {/* Search */}
            <div className="flex-shrink-0">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-3 w-full lg:w-80 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </form>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col lg:flex-row gap-4">
            <div className="flex flex-wrap gap-3 flex-1">
              {/* Category Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.slug.current}>
                      {category.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Author Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                >
                  <option value="">All Authors</option>
                  {authors.map((author) => (
                    <option key={author._id} value={author.slug.current}>
                      {author.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Tag Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  value={filters.tag}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                >
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag._id} value={tag.slug.current}>
                      {tag.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-8 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Popular</option>
                  <option value="featured">Featured</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.category || filters.author || filters.tag || filters.search) && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="text-gray-400 hover:text-white border border-white/10 hover:border-brand-primary/50"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          // Loading State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-dark p-6 animate-pulse">
                <div className="bg-white/10 h-48 rounded-lg mb-4"></div>
                <div className="bg-white/10 h-4 rounded mb-2"></div>
                <div className="bg-white/10 h-4 rounded w-3/4 mb-4"></div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 w-8 h-8 rounded-full"></div>
                  <div className="bg-white/10 h-3 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-league-spartan font-semibold mb-2">No articles found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <Button onClick={clearFilters} className="bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-8">
              <p className="text-gray-400">
                Showing {posts.length} of {pagination.totalPosts || 0} articles
                {filters.search && ` for "${filters.search}"`}
              </p>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <article key={post._id} className="card-dark card-hover group">
                  {/* Featured Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    {post.featuredImage ? (
                      <Image
                        src={urlFor(post.featuredImage).width(400).height(240).url()}
                        alt={post.featuredImage.alt || post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={true}
                        loader={({ src }) => src}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center">
                        <div className="text-4xl font-league-spartan font-bold text-white/20">
                          {post.title.charAt(0)}
                        </div>
                      </div>
                    )}
                    {post.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-primary text-xs">Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category */}
                    {post.category && (
                      <div className="mb-3">
                        <span className={`badge ${getCategoryColor(post.category.color)} text-xs`}>
                          {post.category.title}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="font-league-spartan font-bold text-xl mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors">
                      {post.title}
                    </h2>

                    {/* Summary */}
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                      {post.summary}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag._id} className="text-xs text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-full">
                            #{tag.title}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{post.tags.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        {post.author?.avatar ? (
                          <Image
                            src={urlFor(post.author.avatar).width(32).height(32).url()}
                            alt={post.author.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                            unoptimized={true}
                            loader={({ src }) => src}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-brand-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{post.author?.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt)}
                          </div>
                        </div>
                      </div>
                      {post.estimatedReadingTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {post.estimatedReadingTime} min
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <Link
                        href={`/blog/${post.slug.current}`}
                        className="inline-flex items-center text-brand-primary hover:text-brand-primary/80 font-medium text-sm transition-colors"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="ghost"
                  disabled={pagination.current <= 1}
                  onClick={() => handleFilterChange('page', pagination.current - 1)}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {[...Array(pagination.total)].map((_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={pagination.current === page ? "default" : "ghost"}
                        onClick={() => handleFilterChange('page', page)}
                        className={pagination.current === page 
                          ? "bg-brand-primary text-brand-primary-text" 
                          : "text-gray-400 hover:text-white"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="ghost"
                  disabled={pagination.current >= pagination.total}
                  onClick={() => handleFilterChange('page', pagination.current + 1)}
                  className="text-gray-400 hover:text-white disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}