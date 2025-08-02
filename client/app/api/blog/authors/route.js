import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET() {
  try {
    const query = `*[_type == "author"] | order(name asc) {
      _id,
      name,
      slug,
      avatar,
      bio,
      socialLinks,
      "postCount": count(*[_type == "blogPost" && references(^._id) && status == "published"])
    }`

    const authors = await client.fetch(query)

    return NextResponse.json({ authors })

  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}