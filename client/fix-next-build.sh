#!/bin/bash

echo "🧹 Cleaning Next.js build cache..."

# Kill any running Next.js processes
echo "Stopping Next.js processes..."
pkill -f "next dev" || true
pkill -f "next-server" || true

# Remove build directories
echo "Removing build directories..."
rm -rf .next
rm -rf node_modules/.cache

# Clear npm/yarn cache
echo "Clearing package manager cache..."
npm cache clean --force 2>/dev/null || true
yarn cache clean 2>/dev/null || true

echo "✅ Cleanup complete!"
echo ""
echo "Now run:"
echo "  npm run dev"
echo "or"
echo "  yarn dev"
echo ""
echo "to start the development server again."