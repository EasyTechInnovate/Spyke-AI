'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
export default function RelatedPosts({ posts }) {
  if (!posts || posts.length === 0) {
    return null
  }
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
    <section className="py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-league-spartan font-bold mb-4 text-center">
          Related Articles
        </h2>
        <p className="text-gray-400 text-center">
          Continue your learning journey with these hand-picked articles
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post._id} className="card-dark card-hover group">
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              {post.featuredImage ? (
                <Image
                  src={urlFor(post.featuredImage).width(400).height(240).url()}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized={true}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center">
                  <div className="text-4xl font-league-spartan font-bold text-white/20">
                    {post.title.charAt(0)}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              {post.category && (
                <div className="mb-3">
                  <span className={`badge ${getCategoryColor(post.category.color)} text-xs`}>
                    {post.category.title}
                  </span>
                </div>
              )}
              <h3 className="font-league-spartan font-bold text-xl mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors">
                <Link href={`/blog/${post.slug.current}`}>
                  {post.title}
                </Link>
              </h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                {post.summary}
              </p>
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
              </div>
              <div className="mt-4">
                <Link
                  href={`/blog/${post.slug.current}`}
                  className="inline-flex items-center text-brand-primary hover:text-brand-primary/80 font-medium text-sm transition-colors"
                >
                  Read article →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link href="/blog">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-brand-primary/50 text-white px-8 py-3 rounded-lg transition-all font-medium">
            View All Articles
          </button>
        </Link>
      </div>
    </section>
  )
}