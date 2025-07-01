import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

const config = {
    env: process.env.ENV || 'development',
    server: {
        port: parseInt(process.env.PORT || '5000', 10),
        url: process.env.SERVER_URL || 'http://localhost:5000'
    },
    database: {
        url: process.env.DATABASE_URL
    },
    security: {
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
    },
    client: {
        url: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    imageKit: {
        IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
        IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
        IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT
    }
}

export default config
