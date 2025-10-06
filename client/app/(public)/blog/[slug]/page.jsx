'use client'
import { useState, useEffect, use } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    Calendar,
    Clock,
    User,
    ArrowLeft,
    Share2,
    Twitter,
    Linkedin,
    Facebook,
    Copy,
    ExternalLink,
    MessageCircle,
    Heart,
    BookOpen
} from 'lucide-react'
import { Button } from '@/components/shared/ui/button'
import { urlFor } from '@/sanity/lib/image'
import { PortableText } from '@portabletext/react'
import StickyLeadForm from '../components/StickyLeadForm'
import RelatedPosts from '../components/RelatedPosts'
import SocialShare from '../components/SocialShare'
const portableTextComponents = {
    block: {
        h1: ({ children }) => <h1 className="text-4xl font-league-spartan font-bold mb-6 text-white">{children}</h1>,
        h2: ({ children }) => <h2 className="text-3xl font-league-spartan font-bold mb-5 mt-8 text-white">{children}</h2>,
        h3: ({ children }) => <h3 className="text-2xl font-league-spartan font-bold mb-4 mt-6 text-white">{children}</h3>,
        h4: ({ children }) => <h4 className="text-xl font-league-spartan font-bold mb-3 mt-5 text-white">{children}</h4>,
        normal: ({ children }) => <p className="text-gray-300 leading-relaxed mb-4">{children}</p>,
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-primary pl-6 my-6 italic text-gray-300 bg-brand-primary/5 py-4 rounded-r-lg">
                {children}
            </blockquote>
        )
    },
    list: {
        bullet: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300">{children}</ul>,
        number: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300">{children}</ol>
    },
    listItem: {
        bullet: ({ children }) => <li className="text-gray-300">{children}</li>,
        number: ({ children }) => <li className="text-gray-300">{children}</li>
    },
    marks: {
        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        link: ({ value, children }) => (
            <a
                href={value.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:text-brand-primary/80 underline">
                {children}
            </a>
        )
    },
    types: {
        image: ({ value }) => (
            <div className="my-8">
                <Image
                    src={urlFor(value).width(800).height(400).url()}
                    alt={value.alt || 'Blog image'}
                    width={800}
                    height={400}
                    className="rounded-lg w-full h-auto"
                    unoptimized={true}
                />
                {value.alt && <p className="text-sm text-gray-500 text-center mt-2 italic">{value.alt}</p>}
            </div>
        ),
        codeBlock: ({ value }) => (
            <div className="my-6">
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-b border-gray-700">{value.language || 'Code'}</div>
                    <pre className="p-4 overflow-x-auto">
                        <code className="text-brand-primary text-sm">{value.code}</code>
                    </pre>
                </div>
            </div>
        )
    }
}
export default function BlogPostPage({ params }) {
    const resolvedParams = use(params)
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const whatsappUrl = 'https://wa.link/7uwiza'
    useEffect(() => {
        fetchPost()
    }, [resolvedParams.slug])
    const fetchPost = async () => {
        try {
            const response = await fetch(`/api/blog/posts/${resolvedParams.slug}`)
            if (response.status === 404) {
                notFound()
            }
            if (!response.ok) {
                throw new Error('Failed to fetch post')
            }
            const data = await response.json()
            setPost(data.post)
        } catch (error) {
            console.error('Error fetching post:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
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
    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="animate-pulse">
                        <div className="bg-white/10 h-8 rounded mb-4 w-1/4"></div>
                        <div className="bg-white/10 h-12 rounded mb-6"></div>
                        <div className="bg-white/10 h-64 rounded mb-8"></div>
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={`skeleton-${i}`}
                                    className="bg-white/10 h-4 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    if (error || !post) {
        return (
            <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-league-spartan font-bold mb-4">Article not found</h1>
                    <p className="text-gray-400 mb-6">The article you're looking for doesn't exist or has been moved.</p>
                    <Link href="/blog">
                        <Button className="bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90">Back to Blog</Button>
                    </Link>
                </div>
            </div>
        )
    }
    return (
        <>
            <div className="min-h-screen bg-[#121212] text-white">
                <div className="relative w-full h-[50vh] overflow-hidden rounded-none">
                    {post.featuredImage ? (
                        <Image
                            src={urlFor(post.featuredImage).width(1600).height(800).url()}
                            alt={post.featuredImage.alt || post.title}
                            fill
                            className="object-cover"
                            priority
                            unoptimized={true}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent" />
                    <div className="absolute top-6 left-6 z-10">
                        <Link href="/blog">
                            <Button
                                variant="ghost"
                                className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Blog
                            </Button>
                        </Link>
                    </div>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full px-6">
                        <div className="max-w-5xl mx-auto">
                            {post.category && (
                                <span className={`badge mb-4 inline-block ${getCategoryColor(post.category.color)}`}>{post.category.title}</span>
                            )}
                            <h1 className="text-4xl lg:text-6xl font-league-spartan font-bold leading-tight drop-shadow-md">{post.title}</h1>
                        </div>
                    </div>
                </div>
                {/* META + CONTENT AREA */}
                <div className="max-w-6xl mx-auto px-6 lg:px-10 mt-12">
                    {/* Author + Meta Row */}
                    <div className="flex flex-wrap items-center gap-8 pb-8 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            {post.author?.avatar ? (
                                <Image
                                    src={urlFor(post.author.avatar).width(56).height(56).url()}
                                    alt={post.author.name}
                                    width={56}
                                    height={56}
                                    className="rounded-full"
                                    unoptimized={true}
                                />
                            ) : (
                                <div className="w-14 h-14 bg-brand-primary/20 rounded-full flex items-center justify-center">
                                    <User className="w-7 h-7 text-brand-primary" />
                                </div>
                            )}
                            <div>
                                <Link
                                    href={`/blog/author/${post.author?.slug.current}`}
                                    className="font-medium hover:text-brand-primary transition-colors">
                                    {post.author?.name}
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(post.publishedAt)}
                                </div>
                            </div>
                        </div>
                        {post.estimatedReadingTime && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{post.estimatedReadingTime} min read</span>
                            </div>
                        )}
                        <div className="ml-auto hidden lg:block">
                            <SocialShare post={post} />
                        </div>
                    </div>
                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-10">
                        {/* MAIN ARTICLE */}
                        <article className="lg:col-span-8 xl:col-span-9">
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {post.tags.map((tag) => (
                                        <Link
                                            key={tag._id}
                                            href={`/blog?tag=${tag.slug.current}`}
                                            className="text-xs md:text-sm text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1 rounded-full transition-colors">
                                            #{tag.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                            <div className="prose prose-invert max-w-none">
                                <PortableText
                                    value={post.content}
                                    components={portableTextComponents}
                                />
                            </div>
                            <div className="mt-16 p-6 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-xl border border-brand-primary/20">
                                <h3 className="text-xl font-league-spartan font-bold mb-4">Ready to Automate Your Business?</h3>
                                <p className="text-gray-300 mb-6">
                                    Get custom AI automation solutions tailored to your specific needs. Our experts will help you implement the
                                    strategies.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        asChild
                                        className="bg-brand-primary text-brand-primary-text hover:bg-brand-primary/90">
                                        <a
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Want AI Automation? Explore Now
                                        </a>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="border-brand-secondary text-brand-secondary hover:bg-brand-secondary/10">
                                        <Link href="/explore">
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            See Related AI Products
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            {post.author && (
                                <div className="mt-16 p-6 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-start gap-4">
                                        {post.author.avatar ? (
                                            <Image
                                                src={urlFor(post.author.avatar).width(80).height(80).url()}
                                                alt={post.author.name}
                                                width={80}
                                                height={80}
                                                className="rounded-full flex-shrink-0"
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-8 h-8 text-brand-primary" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h4 className="text-xl font-league-spartan font-bold mb-2">About {post.author.name}</h4>
                                            {post.author.bio && <p className="text-gray-300 mb-4">{post.author.bio}</p>}
                                            {post.author.socialLinks && (
                                                <div className="flex gap-3">
                                                    {post.author.socialLinks.twitter && (
                                                        <a
                                                            href={post.author.socialLinks.twitter}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-brand-primary transition-colors">
                                                            <Twitter className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                    {post.author.socialLinks.linkedin && (
                                                        <a
                                                            href={post.author.socialLinks.linkedin}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-brand-primary transition-colors">
                                                            <Linkedin className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                    {post.author.socialLinks.website && (
                                                        <a
                                                            href={post.author.socialLinks.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-400 hover:text-brand-primary transition-colors">
                                                            <ExternalLink className="w-5 h-5" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </article>
                    </div>
                </div>
                {post.relatedPosts && post.relatedPosts.length > 0 && (
                    <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-4 mb-24">
                        <RelatedPosts posts={post.relatedPosts} />
                    </div>
                )}
                <StickyLeadForm blogPostSlug={post.slug.current} />
            </div>
        </>
    )
}
