#!/usr/bin/env node

/**
 * User Cleanup Script
 * Removes all users except admin@gmail.com
 * 
 * Usage: node scripts/cleanup-users.js
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

// User schema (basic version for cleanup)
const UserSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  role: String,
  // ... other fields
}, { strict: false })

const User = mongoose.model('User', UserSchema)

const cleanupUsers = async () => {
  try {
    console.log('🔍 Starting user cleanup...\n')

    // Find all users
    const allUsers = await User.find({})
    console.log(`📊 Found ${allUsers.length} total users in database`)

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@gmail.com' })
    if (!adminUser) {
      console.log('❌ Admin user (admin@gmail.com) not found!')
      console.log('   Cannot proceed with cleanup without admin user.')
      return
    }

    console.log(`✅ Admin user found: ${adminUser.fullName || adminUser.email}`)

    // Find users to delete (all except admin)
    const usersToDelete = await User.find({ 
      email: { $ne: 'admin@gmail.com' } 
    })

    if (usersToDelete.length === 0) {
      console.log('✅ Only admin user exists in database - no cleanup needed')
      return
    }

    console.log(`\n📋 Users to be deleted (${usersToDelete.length}):`)
    usersToDelete.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.fullName || 'No name'} (${user.role || 'user'})`)
    })

    console.log('\n⚠️  This will permanently delete all users except admin@gmail.com')
    console.log('   This action cannot be undone!')
    
    // Proceed with deletion
    const deleteResult = await User.deleteMany({ 
      email: { $ne: 'admin@gmail.com' } 
    })

    console.log(`\n✅ User cleanup completed!`)
    console.log(`   - Deleted ${deleteResult.deletedCount} users`)
    console.log(`   - Preserved admin user: admin@gmail.com`)

    // Verify cleanup
    const remainingUsers = await User.find({})
    console.log(`\n📊 Database now contains ${remainingUsers.length} user(s):`)
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.fullName || 'No name'} (${user.role || 'user'})`)
    })

  } catch (error) {
    console.error('❌ Error during user cleanup:', error)
  }
}

const main = async () => {
  await connectDB()
  await cleanupUsers()
  await mongoose.disconnect()
  console.log('🔌 Disconnected from MongoDB')
  process.exit(0)
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { cleanupUsers }