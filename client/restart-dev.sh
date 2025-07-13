#!/bin/bash

echo "🔄 Stopping any running Next.js processes..."
pkill -f "next dev" || true

echo "🧹 Clearing Next.js cache..."
rm -rf .next

echo "🚀 Starting Next.js development server..."
npm run dev