import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET() {
  try {
    const query = `*[_type == "category"] | order(title asc) {
      _id,
      title,
      slug,
      description,
      color,
      "postCount": count(*[_type == "blogPost" && references(^._id) && status == "published"])
    }`

    const categories = await client.fetch(query)

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}