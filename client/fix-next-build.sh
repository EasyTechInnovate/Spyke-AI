#!/bin/bash

echo "🧹 Cleaning Next.js build cache..."

# Kill any running Next.js processes
echo "Stopping Next.js processes..."
pkill -f "next dev" || true
pkill -f "next-server" || true
pkill -f "node.*next" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to die
sleep 1

# Remove build directories
echo "Removing build directories..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

# Clear Next.js telemetry
rm -rf ~/.next-telemetry* 2>/dev/null || true

# Clear npm/yarn cache
echo "Clearing package manager cache..."
npm cache clean --force 2>/dev/null || true
yarn cache clean 2>/dev/null || true

# Remove any temporary files
echo "Removing temporary files..."
find . -name "*.hot-update.*" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

echo "✅ Cleanup complete!"
echo ""
echo "Now run:"
echo "  npm run dev"
echo "or"
echo "  yarn dev"
echo ""
echo "to start the development server again."