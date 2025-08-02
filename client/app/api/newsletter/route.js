import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, source, blogPostSlug } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const existingSubscription = await client.fetch(
      `*[_type == "newsletter" && email == $email][0]`,
      { email }
    )

    if (existingSubscription) {
      if (existingSubscription.status === 'unsubscribed') {
        await client
          .patch(existingSubscription._id)
          .set({
            status: 'active',
            subscribedAt: new Date().toISOString()
          })
          .commit()

        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed to newsletter'
        })
      } else {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 400 }
        )
      }
    }

    let blogPostRef = null
    if (blogPostSlug && source === 'blog') {
      const blogPost = await client.fetch(
        `*[_type == "blogPost" && slug.current == $slug][0]._id`,
        { slug: blogPostSlug }
      )
      blogPostRef = blogPost ? { _type: 'reference', _ref: blogPost } : null
    }

    const subscriptionData = {
      _type: 'newsletter',
      email,
      source: source || 'blog',
      subscribedAt: new Date().toISOString(),
      status: 'active',
    }

    if (blogPostRef) {
      subscriptionData.blogPost = blogPostRef
    }

    const result = await client.create(subscriptionData)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriptionId: result._id
    })

  } catch (error) {
    console.error('Error creating newsletter subscription:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const subscription = await client.fetch(
      `*[_type == "newsletter" && email == $email][0]`,
      { email }
    )

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    await client
      .patch(subscription._id)
      .set({ status: 'unsubscribed' })
      .commit()

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    )
  }
}