import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET() {
  try {
    const query = `*[_type == "tag"] | order(title asc) {
      _id,
      title,
      slug,
      description,
      "postCount": count(*[_type == "blogPost" && references(^._id) && status == "published"])
    }`

    const tags = await client.fetch(query)

    return NextResponse.json({ tags })

  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}