'use client'
import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown, Calendar, User, Clock, Folder, Users, Tag, Star, TrendingUp, BarChart3, Archive, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/shared/ui/button'
import { urlFor } from '@/sanity/lib/image'
function WeeklyIdeasForm() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email.trim()) {
            setMessage('Please enter your email address')
            setMessageType('error')
            return
        }
        if (!validateEmail(email)) {
            setMessage('Please enter a valid email address')
            setMessageType('error')
            return
        }
        setIsSubmitting(true)
        setMessage('')
        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    source: 'weekly_ideas'
                })
            })
            const data = await response.json()
            if (response.ok) {
                setMessage('Successfully subscribed! Check your email for confirmation.')
                setMessageType('success')
                setEmail('')
            } else {
                setMessage(data.error || 'Something went wrong. Please try again.')
                setMessageType('error')
            }
        } catch (error) {
            setMessage('Failed to subscribe. Please try again.')
            setMessageType('error')
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white placeholder-gray-400"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        if (message) {
                            setMessage('')
                        }
                    }}
                />
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90 px-6 py-3 disabled:opacity-50 whitespace-nowrap">
                    {isSubmitting ? (
                        <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-brand-primary-text border-t-transparent rounded-full animate-spin mr-2"></div>
                            Subscribing...
                        </div>
                    ) : (
                        'Subscribe Free'
                    )}
                </Button>
            </form>
            {message && <div className={`mt-3 text-sm ${messageType === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message}</div>}
        </div>
    )
}
export default function BlogListingPage() {
    const [allPosts, setAllPosts] = useState([])
    const [filteredPosts, setFilteredPosts] = useState([])
    const [displayedPosts, setDisplayedPosts] = useState([])
    const [categories, setCategories] = useState([])
    const [authors, setAuthors] = useState([])
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState('grid')
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
    useEffect(() => {
        fetchAllData()
    }, [])
    useEffect(() => {
        applyFilters()
    }, [filters, allPosts])
    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [postsRes, categoriesRes, authorsRes, tagsRes] = await Promise.all([
                fetch('/api/blog/posts?limit=1000'),
                fetch('/api/blog/categories'),
                fetch('/api/blog/authors'),
                fetch('/api/blog/tags')
            ])
            const [postsData, categoriesData, authorsData, tagsData] = await Promise.all([
                postsRes.json(),
                categoriesRes.json(),
                authorsRes.json(),
                tagsRes.json()
            ])
            setAllPosts(postsData.posts || [])
            setCategories(categoriesData.categories || [])
            setAuthors(authorsData.authors || [])
            setTags(tagsData.tags || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }
    const applyFilters = () => {
        let filtered = [...allPosts]
        if (filters.category) {
            filtered = filtered.filter((post) => post.category?.slug?.current === filters.category)
        }
        if (filters.author) {
            filtered = filtered.filter((post) => post.author?.slug?.current === filters.author)
        }
        if (filters.tag) {
            filtered = filtered.filter((post) => post.tags?.some((tag) => tag.slug?.current === filters.tag))
        }
        if (filters.search && filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase()
            filtered = filtered.filter((post) => {
                return (
                    post.title?.toLowerCase().includes(searchTerm) ||
                    post.summary?.toLowerCase().includes(searchTerm) ||
                    post.author?.name?.toLowerCase().includes(searchTerm) ||
                    post.category?.title?.toLowerCase().includes(searchTerm) ||
                    post.tags?.some((tag) => tag.title?.toLowerCase().includes(searchTerm))
                )
            })
        }
        filtered.sort((a, b) => {
            switch (filters.sort) {
                case 'oldest':
                    return new Date(a.publishedAt) - new Date(b.publishedAt)
                case 'popular':
                    return new Date(b._createdAt || b.publishedAt) - new Date(a._createdAt || a.publishedAt)
                case 'featured':
                    if (a.featured && !b.featured) return -1
                    if (!a.featured && b.featured) return 1
                    return new Date(b.publishedAt) - new Date(a.publishedAt)
                default:
                    return new Date(b.publishedAt) - new Date(a.publishedAt)
            }
        })
        setFilteredPosts(filtered)
        const totalPosts = filtered.length
        const totalPages = Math.ceil(totalPosts / filters.limit)
        const startIndex = (filters.page - 1) * filters.limit
        const endIndex = startIndex + filters.limit
        const paginatedPosts = filtered.slice(startIndex, endIndex)
        setDisplayedPosts(paginatedPosts)
        setPagination({
            current: filters.page,
            total: totalPages,
            count: paginatedPosts.length,
            totalPosts: totalPosts
        })
    }
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value
        }))
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
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="pt-24 bg-gradient-to-b from-[#0a0a0a] via-[#111111] to-[#121212]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-brand-primary" />
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-league-spartan font-bold text-white">Insights Blog</h1>
                            </div>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                Latest trends, tips, and success stories in AI automation. Discover actionable insights to transform your business.
                            </p>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>Updated Daily</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Expert Insights</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Industry Trends</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0 w-full lg:w-96">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search articles, topics, or authors..."
                                        className="w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex flex-wrap gap-4 flex-1">
                                <div className="relative min-w-[160px]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                    <select
                                        className="relative appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 pr-10 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white w-full"
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}>
                                        <option
                                            value=""
                                            className="bg-gray-900 text-white">
                                            <Folder className="w-4 h-4 inline mr-2" />
                                            All Categories
                                        </option>
                                        {categories.map((category) => (
                                            <option
                                                key={category._id}
                                                value={category.slug.current}
                                                className="bg-gray-900 text-white">
                                                {category.title}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative min-w-[160px]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                    <select
                                        className="relative appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 pr-10 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white w-full"
                                        value={filters.author}
                                        onChange={(e) => handleFilterChange('author', e.target.value)}>
                                        <option
                                            value=""
                                            className="bg-gray-900 text-white">
                                            <Users className="w-4 h-4 inline mr-2" />
                                            All Authors
                                        </option>
                                        {authors.map((author) => (
                                            <option
                                                key={author._id}
                                                value={author.slug.current}
                                                className="bg-gray-900 text-white">
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative min-w-[160px]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                    <select
                                        className="relative appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 pr-10 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white w-full"
                                        value={filters.tag}
                                        onChange={(e) => handleFilterChange('tag', e.target.value)}>
                                        <option
                                            value=""
                                            className="bg-gray-900 text-white">
                                            <Tag className="w-4 h-4 inline mr-2" />
                                            All Tags
                                        </option>
                                        {tags.map((tag) => (
                                            <option
                                                key={tag._id}
                                                value={tag.slug.current}
                                                className="bg-gray-900 text-white">
                                                {tag.title}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <div className="relative min-w-[160px]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                    <select
                                        className="relative appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 pr-10 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-white w-full"
                                        value={filters.sort}
                                        onChange={(e) => handleFilterChange('sort', e.target.value)}>
                                        <option
                                            value="latest"
                                            className="bg-gray-900 text-white">
                                            Latest
                                        </option>
                                        <option
                                            value="oldest"
                                            className="bg-gray-900 text-white">
                                            Oldest
                                        </option>
                                        <option
                                            value="popular"
                                            className="bg-gray-900 text-white">
                                            Popular
                                        </option>
                                        <option
                                            value="featured"
                                            className="bg-gray-900 text-white">
                                            Featured
                                        </option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            {(filters.category || filters.author || filters.tag || filters.search) && (
                                <Button
                                    onClick={clearFilters}
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white border border-white/20 hover:border-brand-primary/50 bg-white/5 hover:bg-white/10 transition-all duration-300 px-6 py-3 rounded-lg">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="space-y-8">
                        <div className="animate-pulse">
                            <div className="h-6 bg-white/10 rounded-lg w-64 mb-8"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden animate-pulse h-[600px]">
                                    <div className="bg-white/10 h-56"></div>
                                    <div className="p-6 space-y-4 h-[344px] flex flex-col">
                                        <div className="bg-white/10 h-4 rounded-lg"></div>
                                        <div className="bg-white/10 h-4 rounded-lg w-3/4"></div>
                                        <div className="bg-white/10 h-3 rounded-lg w-1/2"></div>
                                        <div className="flex-1"></div>
                                        <div className="flex items-center gap-3 pt-4">
                                            <div className="bg-white/10 w-10 h-10 rounded-full"></div>
                                            <div className="space-y-2 flex-1">
                                                <div className="bg-white/10 h-3 rounded-lg w-20"></div>
                                                <div className="bg-white/10 h-2 rounded-lg w-16"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="relative mb-8">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-3xl flex items-center justify-center">
                                <Search className="w-12 h-12 text-brand-primary" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-3xl blur-xl"></div>
                        </div>
                        <h3 className="text-3xl font-league-spartan font-bold mb-4 text-black">
                            {filters.search ? `No articles found for "${filters.search}"` : 'No articles found'}
                        </h3>
                        <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
                            {filters.search
                                ? 'Try different keywords or check your spelling.'
                                : "Try adjusting your filters or search terms to find what you're looking for."}
                        </p>
                        <Button
                            onClick={clearFilters}
                            className="bg-brand-primary text-white hover:bg-brand-primary/90 px-8 py-3 rounded-lg font-medium transition-all duration-300">
                            Clear All Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <p className="text-gray-400 text-lg">
                                    Showing <span className="text-white font-semibold">{displayedPosts.length}</span> of{' '}
                                    <span className="text-white font-semibold">{pagination.totalPosts || 0}</span> articles
                                    {filters.search && (
                                        <span className="ml-2">
                                            for <span className="text-brand-primary font-medium">"{filters.search}"</span>
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                                <span>View:</span>
                                <button
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:text-white'} rounded-lg`}
                                    onClick={() => setViewMode('grid')}>
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24">
                                        <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                                    </svg>
                                </button>
                                <button
                                    className={`p-2 ${viewMode === 'list' ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:text-white'} rounded-lg`}
                                    onClick={() => setViewMode('list')}>
                                    <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24">
                                        <path d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'} mb-16`}>
                            {displayedPosts.map((post, index) =>
                                viewMode === 'grid' ? (
                                    // Grid View - existing card layout
                                    <article
                                        key={post._id}
                                        className="group relative h-[600px]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform scale-105"></div>
                                        <Link
                                            href={`/blog/${post.slug.current}`}
                                            className="block relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 group-hover:transform group-hover:scale-[1.02] h-full cursor-pointer">
                                            <div className="relative h-56 overflow-hidden flex-shrink-0">
                                                {post.featuredImage ? (
                                                    <Image
                                                        src={urlFor(post.featuredImage).width(400).height(240).url()}
                                                        alt={post.featuredImage.alt || post.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                        unoptimized={true}
                                                        loader={({ src }) => src}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center">
                                                        <div className="text-5xl font-league-spartan font-bold text-white/30">
                                                            {post.title.charAt(0)}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                {post.featured && (
                                                    <div className="absolute top-4 left-4">
                                                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                            <Star className="w-3 h-3" />
                                                            Featured
                                                        </span>
                                                    </div>
                                                )}
                                                {post.estimatedReadingTime && (
                                                    <div className="absolute top-4 right-4">
                                                        <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {post.estimatedReadingTime} min
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 flex flex-col flex-1 h-[344px]">
                                                {post.category && (
                                                    <div className="mb-4">
                                                        <span
                                                            className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border ${getCategoryColor(post.category.color)}`}>
                                                            <div className="w-2 h-2 rounded-full bg-current"></div>
                                                            {post.category.title}
                                                        </span>
                                                    </div>
                                                )}
                                                <h2 className="font-league-spartan font-bold text-xl mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors duration-300">
                                                    {post.title}
                                                </h2>
                                                <p className="text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">{post.summary}</p>
                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-6">
                                                        {post.tags.slice(0, 3).map((tag) => (
                                                            <span
                                                                key={tag._id}
                                                                className="text-xs text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded-lg hover:bg-brand-primary/20 transition-colors">
                                                                #{tag.title}
                                                            </span>
                                                        ))}
                                                        {post.tags.length > 3 && (
                                                            <span className="text-xs text-gray-500 px-2 py-1">+{post.tags.length - 3} more</span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex-1"></div>
                                                <div className="mt-auto">
                                                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                                        {post.author?.avatar ? (
                                                            <Image
                                                                src={urlFor(post.author.avatar).width(40).height(40).url()}
                                                                alt={post.author.name}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full ring-2 ring-white/20"
                                                                unoptimized={true}
                                                                loader={({ src }) => src}
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full flex items-center justify-center ring-2 ring-white/20">
                                                                <User className="w-5 h-5 text-brand-primary" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-white">{post.author?.name}</p>
                                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                <Calendar className="w-3 h-3" />
                                                                {formatDate(post.publishedAt)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center text-brand-primary/60 group-hover:text-brand-primary transition-colors">
                                                            <svg
                                                                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9 5l7 7-7 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                ) : (
                                    // List View - horizontal layout
                                    <article
                                        key={post._id}
                                        className="group">
                                        <Link
                                            href={`/blog/${post.slug.current}`}
                                            className="block bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group-hover:bg-white/[0.08] cursor-pointer">
                                            <div className="flex flex-col sm:flex-row">
                                                {/* Image Section */}
                                                <div className="relative w-full sm:w-80 h-48 sm:h-56 flex-shrink-0 overflow-hidden">
                                                    {post.featuredImage ? (
                                                        <Image
                                                            src={urlFor(post.featuredImage).width(320).height(224).url()}
                                                            alt={post.featuredImage.alt || post.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            unoptimized={true}
                                                            loader={({ src }) => src}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 flex items-center justify-center">
                                                            <div className="text-4xl font-league-spartan font-bold text-white/30">
                                                                {post.title.charAt(0)}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {post.featured && (
                                                        <div className="absolute top-3 left-3">
                                                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                                <Star className="w-3 h-3" />
                                                                Featured
                                                            </span>
                                                        </div>
                                                    )}
                                                    {post.estimatedReadingTime && (
                                                        <div className="absolute top-3 right-3">
                                                            <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {post.estimatedReadingTime} min
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content Section */}
                                                <div className="flex-1 p-6 flex flex-col justify-between min-h-[224px]">
                                                    <div>
                                                        {post.category && (
                                                            <div className="mb-3">
                                                                <span
                                                                    className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border ${getCategoryColor(post.category.color)}`}>
                                                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                                                    {post.category.title}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <h2 className="font-league-spartan font-bold text-2xl mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors duration-300">
                                                            {post.title}
                                                        </h2>
                                                        <p className="text-gray-400 text-base line-clamp-3 mb-4 leading-relaxed">{post.summary}</p>
                                                        {post.tags && post.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {post.tags.slice(0, 4).map((tag) => (
                                                                    <span
                                                                        key={tag._id}
                                                                        className="text-xs text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded-lg hover:bg-brand-primary/20 transition-colors">
                                                                        #{tag.title}
                                                                    </span>
                                                                ))}
                                                                {post.tags.length > 4 && (
                                                                    <span className="text-xs text-gray-500 px-2 py-1">
                                                                        +{post.tags.length - 4} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Author and Date */}
                                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                        <div className="flex items-center gap-3">
                                                            {post.author?.avatar ? (
                                                                <Image
                                                                    src={urlFor(post.author.avatar).width(40).height(40).url()}
                                                                    alt={post.author.name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="rounded-full ring-2 ring-white/20"
                                                                    unoptimized={true}
                                                                    loader={({ src }) => src}
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full flex items-center justify-center ring-2 ring-white/20">
                                                                    <User className="w-5 h-5 text-brand-primary" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-white">{post.author?.name}</p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {formatDate(post.publishedAt)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center text-brand-primary/60 group-hover:text-brand-primary transition-colors">
                                                            <svg
                                                                className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M9 5l7 7-7 7"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                )
                            )}
                        </div>
                        {pagination.total > 1 && (
                            <div className="flex justify-center items-center gap-3 py-8">
                                <Button
                                    variant="ghost"
                                    disabled={pagination.current <= 1}
                                    onClick={() => handleFilterChange('page', pagination.current - 1)}
                                    className="text-gray-400 hover:text-white disabled:opacity-50 bg-white/5 border border-white/10 hover:border-brand-primary/30 px-6 py-3 rounded-lg transition-all duration-300">
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                    Previous
                                </Button>
                                <div className="flex gap-2">
                                    {[...Array(Math.min(5, pagination.total))].map((_, i) => {
                                        let page
                                        if (pagination.total <= 5) {
                                            page = i + 1
                                        } else if (pagination.current <= 3) {
                                            page = i + 1
                                        } else if (pagination.current >= pagination.total - 2) {
                                            page = pagination.total - 4 + i
                                        } else {
                                            page = pagination.current - 2 + i
                                        }
                                        return (
                                            <Button
                                                key={page}
                                                variant={pagination.current === page ? 'default' : 'ghost'}
                                                onClick={() => handleFilterChange('page', page)}
                                                className={
                                                    pagination.current === page
                                                        ? 'bg-brand-primary text-black border-brand-primary w-12 h-12 rounded-lg font-medium'
                                                        : 'text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-brand-primary/30 w-12 h-12 rounded-lg transition-all duration-300'
                                                }>
                                                {page}
                                            </Button>
                                        )
                                    })}
                                    {pagination.total > 5 && pagination.current < pagination.total - 2 && (
                                        <>
                                            <span className="flex items-center text-gray-500">...</span>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleFilterChange('page', pagination.total)}
                                                className="text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:border-brand-primary/30 w-12 h-12 rounded-lg transition-all duration-300">
                                                {pagination.total}
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    disabled={pagination.current >= pagination.total}
                                    onClick={() => handleFilterChange('page', pagination.current + 1)}
                                    className="text-gray-400 hover:text-white disabled:opacity-50 bg-white/5 border border-white/10 hover:border-brand-primary/30 px-6 py-3 rounded-lg transition-all duration-300">
                                    Next
                                    <svg
                                        className="w-4 h-4 ml-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0a0a0a] via-[#111111] to-[#0a0a0a] border-t border-white/10 mb-16">
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }}></div>
                </div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="space-y-6 mb-12">
                        <div className="inline-flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-4 py-2 rounded-full text-sm font-medium">
                            <Zap className="w-4 h-4" />
                            Newsletter
                        </div>
                        <h2 className="text-4xl font-league-spartan font-bold text-white">Get Weekly AI Ideas</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            Join thousands of entrepreneurs getting actionable AI insights, automation strategies, and exclusive case studies
                            delivered weekly.
                        </p>
                    </div>
                    <div className="max-w-md mx-auto mb-8">
                        <WeeklyIdeasForm />
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                            <span>Weekly insights</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                            <span>No spam, ever</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"></div>
                            <span>Unsubscribe anytime</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

