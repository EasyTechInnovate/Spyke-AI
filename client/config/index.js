

const config = {
    env: process.env.NODE_ENV || 'development',

    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('Client config loaded (server-side):', {
        env: config.env,
        apiConfigured: !!config.apiUrl
    })
}

export default config