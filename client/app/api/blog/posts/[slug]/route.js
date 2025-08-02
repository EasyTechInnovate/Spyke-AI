import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET(request, { params }) {
  try {
    const { slug } = params

    const query = `*[_type == "blogPost" && slug.current == $slug && status == "published"][0] {
      _id,
      title,
      slug,
      summary,
      "author": author->{
        name,
        slug,
        avatar,
        bio,
        socialLinks
      },
      "category": category->{
        title,
        slug,
        color,
        description
      },
      "tags": tags[]->{
        title,
        slug,
        description
      },
      featuredImage,
      content,
      seo,
      publishedAt,
      featured,
      "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180 ),
      "relatedPosts": *[_type == "blogPost" && status == "published" && _id != ^._id && (category._ref == ^.category._ref || count(tags[@._ref in ^.tags[]._ref]) > 0)] | order(publishedAt desc) [0...3] {
        _id,
        title,
        slug,
        summary,
        "author": author->{name, slug, avatar},
        "category": category->{title, slug, color},
        featuredImage,
        publishedAt
      }
    }`

    const post = await client.fetch(query, { slug })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}