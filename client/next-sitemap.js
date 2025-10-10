/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://spykeai.com',
  generateRobotsTxt: true, // (optional)
  // optional
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://spykeai.com/sitemap.xml',
    ],
  },
  exclude: [
    '/admin/*',
    '/seller/*',
    '/settings/*',
    '/auth/*',
    '/studio/*',
    '/api/*'
  ],
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  generateIndexSitemap: false,
  transform: async (config, path) => {
    // Custom priority based on path
    let priority = config.priority

    if (path === '/') {
      priority = 1.0
    } else if (path.includes('/products/')) {
      priority = 0.9
    } else if (path.includes('/blog/')) {
      priority = 0.8
    } else if (path.includes('/explore')) {
      priority = 0.8
    }

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}