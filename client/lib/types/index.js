// Since you're using .js files, we'll use JSDoc for type definitions

/**
 * @typedef {Object} Creator
 * @property {string} id
 * @property {string} name
 * @property {string} avatar
 * @property {boolean} verified
 * @property {number} totalSales
 */

/**
 * @typedef {Object} Prompt
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {number} price
 * @property {string} category
 * @property {string} tool
 * @property {Creator} creator
 * @property {number} rating
 * @property {number} salesCount
 * @property {string} [image]
 * @property {string[]} tags
 * @property {boolean} [isFeatured]
 * @property {boolean} [isNew]
 */

/**
 * @typedef {Object} Collection
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {Prompt[]} prompts
 * @property {string} [icon]
 */

/**
 * @typedef {Object} UseCase
 * @property {string} id
 * @property {string} role
 * @property {string} title
 * @property {string} description
 * @property {string} icon
 * @property {Prompt[]} prompts
 */

export const FilterTypes = {
    TYPE: ['Prompt', 'Template', 'Automation', 'Guide'],
    TOOL: ['ChatGPT', 'Midjourney', 'Claude', 'Stable Diffusion', 'DALL-E'],
    PRICE: ['Free', 'Under $10', '$10-$50', 'Over $50'],
    INDUSTRY: ['Marketing', 'Sales', 'Development', 'Design', 'Writing', 'Business']
  }