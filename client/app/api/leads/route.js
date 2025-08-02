import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, description, source, blogPostSlug } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    let blogPostRef = null
    if (blogPostSlug && source === 'blog') {
      const blogPost = await client.fetch(
        `*[_type == "blogPost" && slug.current == $slug][0]._id`,
        { slug: blogPostSlug }
      )
      blogPostRef = blogPost ? { _type: 'reference', _ref: blogPost } : null
    }

    const leadData = {
      _type: 'leadCapture',
      name,
      email,
      phone: phone || '',
      description: description || '',
      source: source || 'blog',
      createdAt: new Date().toISOString(),
      status: 'new',
    }

    if (blogPostRef) {
      leadData.blogPost = blogPostRef
    }

    const result = await client.create(leadData)

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: result._id
    })

  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    )
  }
}