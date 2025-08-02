import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'leadCapture',
  title: 'Lead Capture',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          {title: 'Blog Post', value: 'blog'},
          {title: 'Newsletter', value: 'newsletter'},
          {title: 'Sticky Form', value: 'sticky_form'},
          {title: 'General Contact', value: 'contact'},
        ],
      },
      initialValue: 'blog',
    }),
    defineField({
      name: 'blogPost',
      title: 'Related Blog Post',
      type: 'reference',
      to: {type: 'blogPost'},
      hidden: ({parent}) => parent?.source !== 'blog',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'Contacted', value: 'contacted'},
          {title: 'Qualified', value: 'qualified'},
          {title: 'Converted', value: 'converted'},
          {title: 'Not Interested', value: 'not_interested'},
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 3,
    }),
  ],
  orderings: [
    {
      title: 'Created Date, New',
      name: 'createdAtDesc',
      by: [
        {field: 'createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Status',
      name: 'statusAsc',
      by: [
        {field: 'status', direction: 'asc'}
      ]
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      status: 'status',
      source: 'source',
    },
    prepare(selection) {
      const {status, source} = selection
      return Object.assign({}, selection, {
        subtitle: `${selection.subtitle} • ${source} • ${status}`,
      })
    },
  },
})