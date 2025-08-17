/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer'
import crypto from 'crypto'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  reactStrictMode: true,

  // Disable static generation for problematic pages during build
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  images: {
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
    ],
    // Add error handling for failed image loads
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add image fallback for broken URLs
    unoptimized: false,
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
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-sync-external-store)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module) {
                return module.size() > 160000
              },
              name(module) {
                const hash = crypto.createHash('sha1')
                hash.update(module.identifier())
                return `lib-${hash.digest('hex').substring(0, 8)}`
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
            shared: {
              name(_module, chunks) {
                return `shared-${crypto
                  .createHash('sha1')
                  .update(chunks.map((c) => c.name).join('_'))
                  .digest('hex')
                  .substring(0, 8)}`
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }

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
