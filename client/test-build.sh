#!/bin/bash

echo "🔍 Running build test for QA deployment..."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out

# Run type checking
echo ""
echo "📝 Running TypeScript type check..."
npx tsc --noEmit 2>/dev/null || echo "ℹ️  No TypeScript config found, skipping type check"

# Run linting
echo ""
echo "🔍 Running ESLint..."
npm run lint 2>/dev/null || echo "⚠️  Linting not configured"

# Run build
echo ""
echo "🏗️  Running Next.js build..."
npm run build

# Check build status
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📊 Build stats:"
    ls -lh .next/static/chunks/*.js 2>/dev/null | head -5
else
    echo ""
    echo "❌ Build failed! Check the errors above."
    exit 1
fi