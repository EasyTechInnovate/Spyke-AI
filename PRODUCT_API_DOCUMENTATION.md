# Product API Documentation

## Overview

The Product API provides comprehensive endpoints for managing products in the SpykeAI marketplace. It supports different user roles (Public, Seller, Admin) with role-based access control and complete product lifecycle management.

## Product Lifecycle

```
Draft → Published → Archived
  ↑         ↓         ↓
  ←---------←---------←
```

- **Draft**: Product is created but not visible to public
- **Published**: Product is live and available for purchase
- **Archived**: Product is hidden but preserved

## User Roles & Access

### 🌐 Public Access
- View published products
- Search and filter products
- View product details
- No authentication required

### 👨‍💼 Seller Access
- All public access
- Create, update, delete own products
- Manage product status (draft/published/archived)
- View own products with full details
- Requires authentication + seller role

### 🔧 Admin Access
- All seller access
- Verify products
- View all products (any status)
- Manage any product
- Requires authentication + admin role

## API Endpoints

### 📋 Base URL
```
http://localhost:5000/v1/products
```

---

## 🌐 Public Endpoints

### 1. Get All Products
```http
GET /products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `type` (enum): `automation | prompt | agent | bundle | all`
- `category` (enum): Product category
- `industry` (enum): Target industry
- `priceCategory` (enum): `free | under_20 | 20_to_50 | over_50 | all`
- `setupTime` (enum): Setup time required
- `minRating` (number): Minimum rating filter
- `verifiedOnly` (boolean): Show only verified products
- `sortBy` (enum): `createdAt | popularity | rating | price | sales`
- `sortOrder` (enum): `asc | desc`
- `search` (string): Search in title, description, tags
- `sellerId` (ObjectId): Filter by specific seller

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 12,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Features:**
- Only shows published products
- Excludes sensitive fields (reviews, faqs, versions, howItWorks)
- Advanced filtering and search capabilities
- Pagination support

### 2. Get Product by Slug
```http
GET /products/:slug
```

**Response:**
- Complete product details
- Populated seller information
- All reviews with user details
- Increments view count

### 3. Get Related Products
```http
GET /products/:id/related?limit=6
```

**Logic:**
- Finds products with same category, industry, or type
- Excludes current product
- Limited results

---

## 👨‍💼 Seller Endpoints

### 4. Create Product
```http
POST /products
Authorization: Bearer <token>
Roles: seller, admin
```

**Request Body:**
```json
{
  "title": "AI Lead Generation Automation",
  "shortDescription": "Automate lead generation with ChatGPT",
  "fullDescription": "Comprehensive automation solution...",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "images": ["https://example.com/image1.jpg"],
  "previewVideo": "https://example.com/preview.mp4",
  "type": "automation",
  "category": "lead_generation",
  "industry": "saas",
  "price": 29.99,
  "originalPrice": 49.99,
  "toolsUsed": [
    {
      "name": "ChatGPT",
      "logo": "https://example.com/logo.png",
      "model": "GPT-4",
      "link": "https://openai.com/chatgpt"
    }
  ],
  "setupTime": "under_1_hour",
  "targetAudience": "SaaS companies",
  "benefits": ["Reduce manual work by 80%"],
  "useCaseExamples": ["Lead qualification"],
  "howItWorks": ["Step 1...", "Step 2..."],
  "outcome": ["Increased conversion rates"],
  "hasRefundPolicy": true,
  "hasGuarantee": true,
  "guaranteeText": "30-day money-back guarantee",
  "faqs": [
    {
      "question": "How long does setup take?",
      "answer": "45-60 minutes with our guide"
    }
  ],
  "tags": ["automation", "lead-generation"],
  "searchKeywords": ["lead generation", "ai"],
  "currentVersion": "1.0.0"
}
```

**Process:**
1. Validates seller profile is approved
2. Generates unique slug from title + UUID
3. Auto-calculates price category based on price
4. Creates product in draft status
5. Updates seller stats
6. Sends notification to seller

### 5. Get My Products
```http
GET /products/seller/my-products?page=1&limit=10&status=draft
Authorization: Bearer <token>
Roles: seller, admin
```

**Features:**
- Shows all seller's products regardless of status
- Supports status filtering
- Excludes reviews for performance
- Pagination support

### 6. Get Single Seller Product
```http
GET /products/seller/:id
Authorization: Bearer <token>
Roles: seller, admin
```

**Security:**
- Only returns products owned by authenticated seller
- Full product details including all fields

### 7. Update Product
```http
PUT /products/:id
Authorization: Bearer <token>
Roles: seller, admin
```

**Security:**
- Validates ownership (seller can only update own products)
- Admins can update any product
- Auto-recalculates price category if price changes
- Sends notification on successful update

### 8. Update Product Status
```http
POST /products/seller/:id/status
Authorization: Bearer <token>
Roles: seller, admin
```

**Request Body:**
```json
{
  "status": "published" // draft | published | archived
}
```

**Process:**
1. Validates status value against enum
2. Checks product ownership
3. Updates status
4. Sends contextual notification
5. Returns updated product info

### 9. Publish Product (Legacy)
```http
POST /products/:id/publish
Authorization: Bearer <token>
Roles: seller, admin
```

**Note:** Use status endpoint instead for better flexibility

### 10. Delete Product
```http
DELETE /products/:id
Authorization: Bearer <token>
Roles: seller, admin
```

**Process:**
1. Validates ownership
2. Decrements seller's product count
3. Sends confirmation notification

---

## 🔧 Admin Endpoints

### 11. Get All Products (Admin)
```http
GET /products/admin/all?page=1&limit=20&status=published
Authorization: Bearer <token>
Roles: admin
```

**Features:**
- View products in any status
- Filter by seller
- Advanced sorting options
- No field restrictions

### 12. Verify Product
```http
POST /products/:id/verify
Authorization: Bearer <token>
Roles: admin
```

**Request Body:**
```json
{
  "isVerified": true,
  "isTested": true
}
```

**Process:**
- Updates verification status
- Notifies product owner
- Used for quality control

---

## 👥 User Interaction Endpoints

### 13. Add Review
```http
POST /products/:id/review
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent automation!"
}
```

**Validations:**
- Users cannot review own products
- One review per user per product
- Rating must be 1-5

### 14. Toggle Favorite
```http
POST /products/:id/favorite
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isFavorited": true
}
```

### 15. Toggle Upvote
```http
POST /products/:id/upvote
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isUpvoted": true
}
```

---

## 🔒 Security & Validation

### Authentication Middleware
- JWT token validation
- User session management
- Role extraction

### Authorization Middleware
- Role-based access control
- Resource ownership validation
- Admin privilege checks

### Validation Schemas (Zod)
- **createProductSchema**: Complete product validation
- **updateProductSchema**: Partial update validation
- **getProductsSchema**: Query parameter validation
- **updateProductStatusSchema**: Status enum validation
- **addReviewSchema**: Review content validation
- **toggleFavoriteSchema**: Boolean validation
- **verifyProductSchema**: Admin verification validation

### Rate Limiting
- Applied to creation and review endpoints
- Prevents spam and abuse

---

## 📊 Data Models

### Product Schema Fields
- **Basic Info**: title, descriptions, images, video
- **Classification**: type, category, industry
- **Pricing**: price, originalPrice, priceCategory (auto-calculated)
- **Technical**: toolsUsed, setupTime, currentVersion
- **Marketing**: benefits, useCases, outcomes, guarantees
- **Metadata**: slug (auto-generated), sellerId, status
- **Stats**: views, sales, favorites, upvotes, averageRating
- **Content**: howItWorks, faqs, reviews, versions
- **Flags**: isVerified, isTested, hasRefundPolicy

### Status Enum
```javascript
{
  DRAFT: 'draft',
  PUBLISHED: 'published', 
  ARCHIVED: 'archived'
}
```

### Price Categories (Auto-calculated)
```javascript
{
  FREE: 'free',           // price === 0
  UNDER_20: 'under_20',   // price < 20
  TWENTY_TO_FIFTY: '20_to_50', // price <= 50
  OVER_50: 'over_50'      // price > 50
}
```

---

## 🔄 Product Workflow

### 1. Creation Flow
```
Seller → Create Product → Draft Status → Edit/Refine → Publish → Live
```

### 2. Admin Review Flow
```
Published Product → Admin Review → Verify/Test → Verified Badge
```

### 3. Lifecycle Management
```
Draft ⟷ Published ⟷ Archived
```

### 4. User Interaction Flow
```
User Discovers Product → Views Details → Reviews/Favorites → Purchases
```

---

## 🚨 Error Handling

### Common Error Responses
- **400**: Validation errors, bad requests
- **401**: Authentication required
- **403**: Insufficient permissions
- **404**: Product not found
- **422**: Validation errors with detailed messages
- **500**: Internal server errors

### Validation Error Example
```json
{
  "success": false,
  "message": "Title must be less than 100 characters",
  "statusCode": 422
}
```

---

## 📈 Performance Considerations

### Database Queries
- Indexed fields: slug, sellerId, status, category, industry
- Pagination to limit result sets
- Selective field projection for public APIs
- Population control for related data

### Caching Strategy
- Product views increment asynchronously
- Related products cached by category/industry
- Search results can be cached by query

### Rate Limiting
- Creation: Limited per seller per hour
- Reviews: Limited per user per product
- Search: Reasonable query limits

---

## 🧪 Testing

All endpoints are documented in `api/product.http` with example requests for:
- Different user roles
- Various query parameters
- Error scenarios
- Edge cases

Run tests using REST Client in VS Code or similar tools.

---

## 📝 Notes

1. **Slug Generation**: Combines title + UUID for uniqueness
2. **Price Categories**: Auto-calculated, cannot be manually set
3. **Seller Stats**: Automatically updated on product operations
4. **Notifications**: Sent for all major product lifecycle events
5. **Image/Video**: URLs only, no file upload in this API
6. **Search**: Full-text search across multiple fields
7. **Reviews**: Integrated rating system affects product averageRating

This API provides a complete product management system suitable for marketplace applications with proper role separation and security controls.