#!/usr/bin/env node

/**
 * Database Cleanup Script
 * Removes all via.placeholder.com URLs from the database
 * 
 * Usage: node scripts/cleanup-placeholder-images.js
 */

const mongoose = require('mongoose')

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spyke-ai'
    await mongoose.connect(mongoURI)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Product schema (basic version for cleanup)
const ProductSchema = new mongoose.Schema({
  title: String,
  thumbnail: String,
  images: [String],
  // ... other fields
}, { strict: false })

const Product = mongoose.model('Product', ProductSchema)

const cleanup = async () => {
  try {
    console.log('🔍 Starting placeholder image cleanup...\n')

    // Find products with via.placeholder.com URLs
    const productsWithPlaceholders = await Product.find({
      $or: [
        { thumbnail: { $regex: 'via\.placeholder\.com', $options: 'i' } },
        { images: { $elemMatch: { $regex: 'via\.placeholder\.com', $options: 'i' } } }
      ]
    })

    console.log(`📊 Found ${productsWithPlaceholders.length} products with placeholder URLs`)

    if (productsWithPlaceholders.length === 0) {
      console.log('✅ No placeholder URLs found in database')
      return
    }

    // Log the products that will be updated
    console.log('\n📋 Products to be updated:')
    productsWithPlaceholders.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`)
      if (product.thumbnail && product.thumbnail.includes('via.placeholder.com')) {
        console.log(`   - Thumbnail: ${product.thumbnail}`)
      }
      if (product.images && product.images.some(img => img.includes('via.placeholder.com'))) {
        const placeholderImages = product.images.filter(img => img.includes('via.placeholder.com'))
        console.log(`   - Images: ${placeholderImages.length} placeholder image(s)`)
      }
    })

    // Ask for confirmation
    console.log('\n⚠️  This will remove all via.placeholder.com URLs from your database.')
    console.log('   Products with these URLs will have their thumbnail/images fields cleared.')
    
    // In a real script, you'd want to prompt for confirmation
    // For now, we'll proceed with the cleanup
    
    let updatedCount = 0

    // Update thumbnails
    const thumbnailResult = await Product.updateMany(
      { thumbnail: { $regex: 'via\.placeholder\.com', $options: 'i' } },
      { $unset: { thumbnail: '' } }
    )
    updatedCount += thumbnailResult.modifiedCount

    // Update images arrays
    const imageResult = await Product.updateMany(
      { images: { $elemMatch: { $regex: 'via\.placeholder\.com', $options: 'i' } } },
      { $pull: { images: { $regex: 'via\.placeholder\.com', $options: 'i' } } }
    )
    updatedCount += imageResult.modifiedCount

    console.log(`\n✅ Cleanup completed!`)
    console.log(`   - Updated ${thumbnailResult.modifiedCount} thumbnail fields`)
    console.log(`   - Updated ${imageResult.modifiedCount} image arrays`)
    console.log(`   - Total documents modified: ${updatedCount}`)

    // Verify cleanup
    const remainingPlaceholders = await Product.find({
      $or: [
        { thumbnail: { $regex: 'via\.placeholder\.com', $options: 'i' } },
        { images: { $elemMatch: { $regex: 'via\.placeholder\.com', $options: 'i' } } }
      ]
    })

    if (remainingPlaceholders.length === 0) {
      console.log('✅ All placeholder URLs successfully removed from database')
    } else {
      console.log(`⚠️  ${remainingPlaceholders.length} products still have placeholder URLs`)
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

const main = async () => {
  await connectDB()
  await cleanup()
  await mongoose.disconnect()
  console.log('🔌 Disconnected from MongoDB')
  process.exit(0)
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { cleanup }