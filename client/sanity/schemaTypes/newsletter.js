import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'newsletter',
  title: 'Newsletter Subscription',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Unsubscribed', value: 'unsubscribed'},
          {title: 'Bounced', value: 'bounced'},
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          {title: 'Blog Post', value: 'blog'},
          {title: 'Homepage', value: 'homepage'},
          {title: 'Footer', value: 'footer'},
          {title: 'Popup', value: 'popup'},
        ],
      },
    }),
    defineField({
      name: 'blogPost',
      title: 'Related Blog Post',
      type: 'reference',
      to: {type: 'blogPost'},
      hidden: ({parent}) => parent?.source !== 'blog',
    }),
  ],
  orderings: [
    {
      title: 'Subscribed Date, New',
      name: 'subscribedAtDesc',
      by: [
        {field: 'subscribedAt', direction: 'desc'}
      ]
    },
  ],
  preview: {
    select: {
      title: 'email',
      status: 'status',
      source: 'source',
    },
    prepare(selection) {
      const {status, source} = selection
      return Object.assign({}, selection, {
        subtitle: `${source || 'unknown'} • ${status}`,
      })
    },
  },
})