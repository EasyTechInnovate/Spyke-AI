/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer'
import crypto from 'crypto'
import path from 'path'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,

  // Disable static generation for problematic pages during build
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  images: {
    // Keep unoptimized false for production performance
    unoptimized: false,
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.promptbase.com',
        pathname: '/**',
      },
      // Add your QA and production domains
      {
        protocol: 'https',
        hostname: 'qa.spykeai.com',
        port: '8443',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'spykeai.com',
        pathname: '/**',
      },
      // Add localhost for development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Add common CDN domains
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      // Add ImageKit for your uploads
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
      // Add any other domains you might use
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      }
    ],
    
    // Fallback domains (legacy configuration for compatibility)
    domains: [
      'images.unsplash.com',
      'cdn.sanity.io', 
      'images.pexels.com',
      'placehold.co',
      'via.placeholder.com',
      'picsum.photos',
      'dummyimage.com',
      'assets.promptbase.com',
      'qa.spykeai.com',
      'spykeai.com',
      'localhost',
      'res.cloudinary.com',
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',
      'ik.imagekit.io'
    ],
    
    // Image format optimization
    formats: ['image/webp', 'image/avif'],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Add error handling for failed image loads
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Minimize layout shift and improve error handling
    minimumCacheTTL: 60,
    
    // Add better loader configuration
    loader: 'default',
    path: '/_next/image',
    
    // Add custom loader for better error handling
    loaderFile: undefined,
  },

  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },

  productionBrowserSourceMaps: false,

  experimental: {
    optimizePackageImports: ['lucide-react', 'sonner', '@/components', '@/lib', 'framer-motion'],
    optimizeCss: true,
    webpackBuildWorker: true,
  },

  // ✅ Updated according to Next.js 14+ requirements
  serverExternalPackages: ['bcrypt', 'sharp'],

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          minRemainingSize: 0,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: false,
            default: false,
            // React framework bundle
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-sync-external-store)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Next.js runtime
            nextjs: {
              name: 'nextjs',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]next[\\/]/,
              priority: 35,
              enforce: true,
            },
            // Charts and visualization libraries
            charts: {
              name: 'charts',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](recharts|chart\.js|d3|plotly)[\\/]/,
              priority: 30,
              enforce: true,
            },
            // Animation libraries
            animation: {
              name: 'animation',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](framer-motion|lottie-react|react-spring)[\\/]/,
              priority: 25,
              enforce: true,
            },
            // UI component libraries
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](lucide-react|@headlessui|@radix-ui)[\\/]/,
              priority: 20,
              enforce: true,
            },
            // Utilities and common libraries
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier())
              },
              name(module) {
                const hash = crypto.createHash('sha1').update(module.identifier()).digest('hex').substring(0, 8)
                return `lib-${hash}`
              },
              priority: 15,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            // Application code commons
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              test: /[\\/]src[\\/]|[\\/]components[\\/]|[\\/]lib[\\/]/,
            },
            // Page-specific chunks
            shared: {
              name(module, chunks) {
                const names = chunks.map(chunk => chunk.name).filter(Boolean)
                if (names.length === 1) return names[0]
                return `shared-${crypto.createHash('sha1').update(names.join('')).digest('hex').substring(0, 8)}`
              },
              priority: 5,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
        // Better tree shaking
        usedExports: true,
        sideEffects: false,
        // Minimize bundle size
        minimize: true,
      }
    }

    // Optimize module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve('./'),
    }

    // Ignore source maps in production
    config.module.rules.push({
      test: /\.map$/,
      use: 'ignore-loader',
    })

    return config
  },

  compress: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default withBundleAnalyzer(nextConfig)
