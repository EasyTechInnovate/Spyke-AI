import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!q || q.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const searchTerm = q.trim()

    const query = `*[_type == "blogPost" && status == "published" && (
      title match $searchTerm ||
      summary match $searchTerm ||
      pt::text(content) match $searchTerm ||
      author->name match $searchTerm ||
      category->title match $searchTerm ||
      tags[]->title match $searchTerm
    )] | order(_score desc, publishedAt desc) [0...$limit] {
      _id,
      title,
      slug,
      summary,
      "author": author->{name, slug, avatar},
      "category": category->{title, slug, color},
      "tags": tags[]->{title, slug},
      featuredImage,
      publishedAt,
      "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180 )
    }`

    const posts = await client.fetch(query, { 
      searchTerm: `${searchTerm}*`,
      limit 
    })

    return NextResponse.json({
      posts,
      query: searchTerm,
      count: posts.length
    })

  } catch (error) {
    console.error('Error searching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to search blog posts' },
      { status: 500 }
    )
  }
}