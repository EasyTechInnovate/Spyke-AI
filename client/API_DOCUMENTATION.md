# Blog API Documentation

## Base URL
```
https://yourdomain.com/api
```

## Table of Contents
- [Blog Posts](#blog-posts)
- [Categories](#categories)
- [Authors](#authors)
- [Tags](#tags)
- [Search](#search)
- [Lead Capture](#lead-capture)
- [Newsletter](#newsletter)
- [Error Handling](#error-handling)

---

## Blog Posts

### Get All Blog Posts
Get a paginated list of published blog posts with filtering and sorting options.

**Endpoint:** `GET /blog/posts`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of posts per page (max 50) |
| `category` | string | - | Filter by category slug |
| `author` | string | - | Filter by author slug |
| `tag` | string | - | Filter by tag slug |
| `sort` | string | latest | Sort order: `latest`, `oldest`, `popular`, `featured` |
| `featured` | boolean | - | Filter featured posts only |

**Example Request:**
```bash
GET /api/blog/posts?page=1&limit=5&category=ai-trends&sort=latest&featured=true
```

**Response:**
```json
{
  "posts": [
    {
      "_id": "post-id",
      "title": "Getting Started with AI Automation",
      "slug": {
        "current": "getting-started-ai-automation"
      },
      "summary": "Learn how to implement AI automation in your business workflow with practical examples and best practices.",
      "author": {
        "name": "John Doe",
        "slug": {
          "current": "john-doe"
        },
        "avatar": {
          "_type": "image",
          "asset": {
            "_ref": "image-asset-id"
          }
        }
      },
      "category": {
        "title": "AI Trends",
        "slug": {
          "current": "ai-trends"
        },
        "color": "blue"
      },
      "tags": [
        {
          "title": "ChatGPT",
          "slug": {
            "current": "chatgpt"
          }
        },
        {
          "title": "Automation",
          "slug": {
            "current": "automation"
          }
        }
      ],
      "featuredImage": {
        "_type": "image",
        "asset": {
          "_ref": "image-asset-id"
        },
        "alt": "AI Automation Workflow"
      },
      "publishedAt": "2024-01-15T10:30:00Z",
      "featured": true,
      "estimatedReadingTime": 8
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "count": 5,
    "totalPosts": 23
  }
}
```

### Get Single Blog Post
Retrieve a specific blog post by its slug with related posts.

**Endpoint:** `GET /blog/posts/{slug}`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Blog post slug |

**Example Request:**
```bash
GET /api/blog/posts/getting-started-ai-automation
```

**Response:**
```json
{
  "post": {
    "_id": "post-id",
    "title": "Getting Started with AI Automation",
    "slug": {
      "current": "getting-started-ai-automation"
    },
    "summary": "Learn how to implement AI automation...",
    "author": {
      "name": "John Doe",
      "slug": {
        "current": "john-doe"
      },
      "avatar": {
        "_type": "image",
        "asset": {
          "_ref": "image-asset-id"
        }
      },
      "bio": "AI specialist with 10+ years experience",
      "socialLinks": {
        "twitter": "https://twitter.com/johndoe",
        "linkedin": "https://linkedin.com/in/johndoe",
        "website": "https://johndoe.com"
      }
    },
    "category": {
      "title": "AI Trends",
      "slug": {
        "current": "ai-trends"
      },
      "color": "blue",
      "description": "Latest trends in artificial intelligence"
    },
    "tags": [
      {
        "title": "ChatGPT",
        "slug": {
          "current": "chatgpt"
        },
        "description": "OpenAI's conversational AI model"
      }
    ],
    "featuredImage": {
      "_type": "image",
      "asset": {
        "_ref": "image-asset-id"
      },
      "alt": "AI Automation Workflow"
    },
    "content": [
      {
        "_type": "block",
        "children": [
          {
            "_type": "span",
            "text": "Introduction to AI automation..."
          }
        ]
      }
    ],
    "seo": {
      "metaTitle": "Getting Started with AI Automation - SpykeAI",
      "metaDescription": "Learn how to implement AI automation in your business...",
      "ogImage": {
        "_type": "image",
        "asset": {
          "_ref": "image-asset-id"
        }
      }
    },
    "publishedAt": "2024-01-15T10:30:00Z",
    "featured": true,
    "estimatedReadingTime": 8,
    "relatedPosts": [
      {
        "_id": "related-post-1",
        "title": "Advanced AI Techniques",
        "slug": {
          "current": "advanced-ai-techniques"
        },
        "summary": "Take your AI skills to the next level...",
        "author": {
          "name": "Jane Smith",
          "slug": {
            "current": "jane-smith"
          },
          "avatar": {
            "_type": "image",
            "asset": {
              "_ref": "image-asset-id"
            }
          }
        },
        "category": {
          "title": "AI Trends",
          "slug": {
            "current": "ai-trends"
          },
          "color": "blue"
        },
        "featuredImage": {
          "_type": "image",
          "asset": {
            "_ref": "image-asset-id"
          }
        },
        "publishedAt": "2024-01-10T14:20:00Z"
      }
    ]
  }
}
```

---

## Categories

### Get All Categories
Retrieve all blog categories with post counts.

**Endpoint:** `GET /blog/categories`

**Response:**
```json
{
  "categories": [
    {
      "_id": "category-id",
      "title": "AI Trends",
      "slug": {
        "current": "ai-trends"
      },
      "description": "Latest trends in artificial intelligence",
      "color": "blue",
      "postCount": 15
    },
    {
      "_id": "category-id-2",
      "title": "Product Tips",
      "slug": {
        "current": "product-tips"
      },
      "description": "Tips and tricks for using our products",
      "color": "green",
      "postCount": 8
    }
  ]
}
```

---

## Authors

### Get All Authors
Retrieve all blog authors with post counts.

**Endpoint:** `GET /blog/authors`

**Response:**
```json
{
  "authors": [
    {
      "_id": "author-id",
      "name": "John Doe",
      "slug": {
        "current": "john-doe"
      },
      "avatar": {
        "_type": "image",
        "asset": {
          "_ref": "image-asset-id"
        }
      },
      "bio": "AI specialist with 10+ years experience",
      "socialLinks": {
        "twitter": "https://twitter.com/johndoe",
        "linkedin": "https://linkedin.com/in/johndoe",
        "website": "https://johndoe.com"
      },
      "postCount": 12
    }
  ]
}
```

---

## Tags

### Get All Tags
Retrieve all blog tags with post counts.

**Endpoint:** `GET /blog/tags`

**Response:**
```json
{
  "tags": [
    {
      "_id": "tag-id",
      "title": "ChatGPT",
      "slug": {
        "current": "chatgpt"
      },
      "description": "OpenAI's conversational AI model",
      "postCount": 25
    },
    {
      "_id": "tag-id-2",
      "title": "Automation",
      "slug": {
        "current": "automation"
      },
      "description": "Business process automation",
      "postCount": 18
    }
  ]
}
```

---

## Search

### Search Blog Posts
Search through blog posts by title, content, author, category, or tags.

**Endpoint:** `GET /blog/search`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (minimum 2 characters) |
| `limit` | number | No | Number of results (default: 10, max: 50) |

**Example Request:**
```bash
GET /api/blog/search?q=automation&limit=5
```

**Response:**
```json
{
  "posts": [
    {
      "_id": "post-id",
      "title": "Getting Started with AI Automation",
      "slug": {
        "current": "getting-started-ai-automation"
      },
      "summary": "Learn how to implement AI automation...",
      "author": {
        "name": "John Doe",
        "slug": {
          "current": "john-doe"
        },
        "avatar": {
          "_type": "image",
          "asset": {
            "_ref": "image-asset-id"
          }
        }
      },
      "category": {
        "title": "AI Trends",
        "slug": {
          "current": "ai-trends"
        },
        "color": "blue"
      },
      "tags": [
        {
          "title": "Automation",
          "slug": {
            "current": "automation"
          }
        }
      ],
      "featuredImage": {
        "_type": "image",
        "asset": {
          "_ref": "image-asset-id"
        }
      },
      "publishedAt": "2024-01-15T10:30:00Z",
      "estimatedReadingTime": 8
    }
  ],
  "query": "automation",
  "count": 1
}
```

---

## Lead Capture

### Submit Lead Form
Capture leads from blog posts or other sources.

**Endpoint:** `POST /leads`

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+1234567890",
  "description": "I'm interested in custom AI automation for my e-commerce business",
  "source": "blog",
  "blogPostSlug": "getting-started-ai-automation"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Lead's full name |
| `email` | string | Yes | Valid email address |
| `phone` | string | No | Phone number |
| `description` | string | No | Lead's message or requirements |
| `source` | string | No | Lead source: `blog`, `sticky_form`, `newsletter`, `contact` |
| `blogPostSlug` | string | No | Related blog post slug (if source is 'blog') |

**Response:**
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "leadId": "lead-doc-id"
}
```

---

## Newsletter

### Subscribe to Newsletter
Add email to newsletter subscription.

**Endpoint:** `POST /newsletter`

**Request Body:**
```json
{
  "email": "john@example.com",
  "source": "blog",
  "blogPostSlug": "getting-started-ai-automation"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `source` | string | No | Subscription source: `blog`, `homepage`, `footer`, `popup` |
| `blogPostSlug` | string | No | Related blog post slug (if source is 'blog') |

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter",
  "subscriptionId": "subscription-doc-id"
}
```

### Unsubscribe from Newsletter
Remove email from newsletter subscription.

**Endpoint:** `DELETE /newsletter?email=john@example.com`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Email address to unsubscribe |

**Response:**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from newsletter"
}
```

---

## Error Handling

All API endpoints follow consistent error response format:

### Error Response Format
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters or missing required fields |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server-side error |

### Common Error Examples

**400 Bad Request:**
```json
{
  "error": "Name and email are required"
}
```

**404 Not Found:**
```json
{
  "error": "Blog post not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch blog posts"
}
```

---

## Usage Examples

### Fetch Latest Featured Posts
```javascript
const response = await fetch('/api/blog/posts?featured=true&limit=3&sort=latest');
const data = await response.json();
```

### Search for AI-related Posts
```javascript
const response = await fetch('/api/blog/search?q=artificial%20intelligence&limit=10');
const data = await response.json();
```

### Submit Lead Capture Form
```javascript
const response = await fetch('/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Smith',
    email: 'john@example.com',
    description: 'Interested in AI automation',
    source: 'blog',
    blogPostSlug: 'getting-started-ai-automation'
  })
});
const data = await response.json();
```

### Subscribe to Newsletter
```javascript
const response = await fetch('/api/newsletter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    source: 'blog'
  })
});
const data = await response.json();
```

---

## Rate Limiting
- No rate limiting currently implemented
- Consider implementing rate limiting for production use
- Recommended: 100 requests per minute per IP

## Authentication
- No authentication required for read operations
- Consider implementing API keys for write operations in production

## CORS
- Configure CORS headers appropriately for your domain
- Current setup allows all origins (development only)