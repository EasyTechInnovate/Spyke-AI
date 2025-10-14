/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer'
import path from 'path'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,

  // Output configuration for production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Image optimization configuration
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Remote image patterns
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
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      }
    ],
    
    // Legacy domains for backward compatibility
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
  },

  // Import optimization
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },

  // Performance optimizations
  productionBrowserSourceMaps: false,
  compress: true,
  poweredByHeader: false,

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'sonner', '@/components', '@/lib', 'framer-motion'],
    optimizeCss: true,
    webpackBuildWorker: true,
  },

  // Server configuration
  serverExternalPackages: ['bcrypt', 'sharp'],

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Custom webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations for production client builds
    if (!dev && !isServer) {
      // Optimize module resolution
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve('./'),
      }

      // Enhanced split chunks configuration
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            reuseExistingChunk: true,
          },
          // React framework chunk
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: 'react-framework',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // Next.js framework chunk
          nextjs: {
            test: /[\\/]node_modules[\\/]next[\\/]/,
            name: 'nextjs-framework',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // UI libraries chunk
          ui: {
            test: /[\\/]node_modules[\\/](lucide-react|@headlessui|@radix-ui|framer-motion)[\\/]/,
            name: 'ui-libraries',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // Large libraries chunk
          libs: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Create chunk name based on package name
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1]
              return `lib-${packageName?.replace('@', '').replace('/', '-') || 'misc'}`
            },
            chunks: 'all',
            priority: 5,
            minSize: 100000,
            reuseExistingChunk: true,
          },
          // Commons chunk for application code
          commons: {
            test: /[\\/](components|lib|hooks|utils|store)[\\/]/,
            name: 'commons',
            chunks: 'all',
            priority: 1,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      }

      // Additional optimizations
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        usedExports: true,
        sideEffects: false,
        minimize: true,
      }
    }

    // Add module rules for better handling
    config.module.rules.push({
      test: /\.map$/,
      use: 'ignore-loader',
    })

    // Improve performance for development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }

    return config
  },

  // HTTP headers for caching
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
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Redirects and rewrites can be added here if needed
  async redirects() {
    return []
  },

  async rewrites() {
    return []
  },
}

export default withBundleAnalyzer(nextConfig)
