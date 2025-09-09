# Product Discovery Algorithm Documentation

## Overview
This document explains the sophisticated product discovery system implemented for the Spyke AI marketplace. The system provides multiple discovery endpoints that use intelligent algorithms to surface the most relevant and engaging products to users.

## Algorithm Logic

### Featured Products Algorithm

The featured products algorithm uses a comprehensive scoring system that considers multiple factors to rank products:

#### Core Scoring Components

1. **Sales Performance (Weight: 2x)**
   - Products with higher sales get priority
   - Directly indicates market validation and user satisfaction

2. **Rating Quality (Weight: 10x)**
   - Average rating multiplied by 10 for significant impact
   - Ensures high-quality products are prioritized

3. **Community Engagement (Weight: 1.5x)**
   - Upvotes from users indicate community approval
   - Social proof factor for product quality

4. **View Count (Weight: 0.1x)**
   - Popularity indicator with minimal weight
   - Prevents view manipulation from dominating scores

#### Bonus Scoring System

1. **Verification Bonus (+15 points)**
   - Admin-verified products get significant boost
   - Ensures quality and trustworthiness

2. **Guarantee Bonus (+10 points)**
   - Products with guarantees get additional points
   - Reduces buyer risk and increases confidence

3. **High Rating Bonus (+20 points)**
   - Products with 4.5+ rating get extra boost
   - Rewards consistently excellent products

#### Advanced Features

1. **Recency Factor**
   - Newer products get slight advantage
   - Prevents stagnation of old products
   - Calculated based on days since creation

2. **Diversity Boost**
   - Different product types get varied treatment
   - Ensures balanced representation across categories
   - Prompts, AI Agents, and GPTs each have tailored scoring

3. **Category Balancing**
   - Ensures representation across different categories
   - Prevents single category domination


## Discovery Endpoints

### 1. Featured Products (`/products/featured`)
- **Algorithm**: Comprehensive scoring system described above
- **Parameters**: 
  - `limit`: Number of products (default: 12)
  - `category`: Filter by category
  - `type`: Filter by product type
  - `minRating`: Minimum rating filter (default: 3.5)
- **Use Case**: Homepage highlights, premium product showcases

### 2. Trending Products (`/products/trending`)
- **Algorithm**: High engagement products from recent time period
- **Logic**: 
  - Filters by creation date within specified days
  - Prioritizes high sales and upvotes in short timeframe
  - Indicates products gaining momentum
- **Parameters**:
  - `days`: Time period (default: 7)
  - `limit`: Number of products (default: 10)
- **Use Case**: "What's Hot" sections, trending showcases

### 3. High Rated Products (`/products/high-rated`)
- **Algorithm**: Quality-first approach focusing on ratings
- **Logic**:
  - Minimum 4.0 average rating required
  - Requires minimum number of reviews for credibility
  - Sorted by rating then review count
- **Parameters**:
  - `limit`: Number of products (default: 10)
  - `minReviews`: Minimum review count (default: 3)
- **Use Case**: Quality assurance sections, premium recommendations

### 4. Recently Added (`/products/recently-added`)
- **Algorithm**: Chronological with quality filter
- **Logic**:
  - Products created within specified timeframe
  - Maintains quality threshold (3.0+ rating)
  - Sorted by creation date (newest first)
- **Parameters**:
  - `days`: Time period (default: 30)
  - `limit`: Number of products (default: 12)
- **Use Case**: "New Arrivals" sections, fresh content discovery

### 5. Complete Discovery (`/products/discovery`)
- **Algorithm**: Comprehensive dashboard combining all algorithms
- **Logic**:
  - Returns curated selection from each category
  - Balanced representation across all discovery types
  - Optimized for homepage and dashboard displays
- **Returns**:
  ```javascript
  {
    featured: [...],      // Top 8 featured products
    trending: [...],      // Top 6 trending products
    highRated: [...],     // Top 6 high-rated products
    recentlyAdded: [...]  // Top 8 recently added products
  }
  ```

## Performance Optimizations

### Database Indexing
Recommended indexes for optimal performance:
```javascript
// Compound indexes for discovery queries
{ status: 1, isActive: 1, isBlocked: 1, isDeleted: 1, averageRating: -1 }
{ status: 1, isActive: 1, createdAt: -1 }
{ averageRating: -1, reviewCount: -1 }
{ salesCount: -1, upvoteCount: -1 }
```

### Caching Strategy
- Featured products: Cache for 15 minutes
- Trending products: Cache for 5 minutes
- High-rated products: Cache for 30 minutes
- Recently added: Cache for 10 minutes

### Query Optimization
- Pagination support for all endpoints
- Selective field projection to reduce data transfer
- Efficient aggregation pipelines with proper $match stages

## Algorithm Benefits

1. **Multi-dimensional Scoring**: Considers sales, quality, engagement, and freshness
2. **Anti-gaming**: Weighted system prevents manipulation of single metrics
3. **Quality Assurance**: Verification and guarantee bonuses promote trust
4. **Freshness**: Recency factors prevent stagnation
5. **Diversity**: Category and type balancing ensures varied recommendations
6. **Scalability**: MongoDB aggregation provides efficient large-scale processing
7. **Flexibility**: Configurable parameters for different use cases

## Future Enhancements

1. **Machine Learning Integration**: User behavior-based personalization
2. **A/B Testing**: Algorithm variant testing for optimization
3. **Real-time Updates**: Live scoring updates based on user interactions
4. **Seasonal Adjustments**: Time-based algorithm modifications
5. **User Preference Learning**: Personalized discovery based on user history