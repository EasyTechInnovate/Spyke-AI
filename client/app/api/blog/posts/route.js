import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const tag = searchParams.get('tag')
    const sort = searchParams.get('sort') || 'latest'
    const featured = searchParams.get('featured') === 'true'

    let query = `*[_type == "blogPost" && status == "published"`

    if (category) {
      query += ` && category->slug.current == "${category}"`
    }

    if (author) {
      query += ` && author->slug.current == "${author}"`
    }

    if (tag) {
      query += ` && "${tag}" in tags[]->slug.current`
    }

    if (featured) {
      query += ` && featured == true`
    }

    query += `] {
      _id,
      title,
      slug,
      summary,
      "author": author->{name, slug, avatar},
      "category": category->{title, slug, color},
      "tags": tags[]->{title, slug},
      featuredImage,
      publishedAt,
      featured,
      "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180 )
    }`

    let orderBy = ''
    switch (sort) {
      case 'popular':
        orderBy = ' | order(_createdAt desc)'
        break
      case 'featured':
        orderBy = ' | order(featured desc, publishedAt desc)'
        break
      case 'oldest':
        orderBy = ' | order(publishedAt asc)'
        break
      default:
        orderBy = ' | order(publishedAt desc)'
    }

    query += orderBy

    const start = (page - 1) * limit
    const end = start + limit
    query += `[${start}...${end}]`

    const posts = await client.fetch(query)

    const totalQuery = query.split('] {')[0] + `]`
    const total = await client.fetch(`count(${totalQuery})`)

    return NextResponse.json({
      posts,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: posts.length,
        totalPosts: total
      }
    })

  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}