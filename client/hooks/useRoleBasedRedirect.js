import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useRoleBasedRedirect = () => {
    const [loading, setLoading] = useState(false)
    const [loaderType, setLoaderType] = useState('default')
    const [loaderMessage, setLoaderMessage] = useState('')
    const [loaderSubMessage, setLoaderSubMessage] = useState('')
    const router = useRouter()

    const startRedirect = (type, message, subMessage, redirectUrl, delay = 1500) => {
        setLoading(true)
        setLoaderType(type)
        setLoaderMessage(message)
        setLoaderSubMessage(subMessage)

        setTimeout(() => {
            router.push(redirectUrl)
            setTimeout(() => {
                setLoading(false)
            }, 500)
        }, delay)
    }

    const redirectBasedOnRole = (roles = []) => {
        if (roles.includes('admin')) {
            startRedirect(
                'admin',
                'Welcome, Administrator',
                'Accessing your admin dashboard...',
                '/admin/dashboard'
            )
        } else if (roles.includes('seller')) {
            startRedirect(
                'seller',
                'Welcome, Seller',
                'Loading your business dashboard...',
                '/seller/dashboard'
            )
        } else {
            startRedirect(
                'user',
                'Welcome Back',
                'Taking you to your personalized experience...',
                '/'
            )
        }
    }

    const showAuthLoader = (redirectUrl = '/') => {
        startRedirect(
            'auth',
            'Authentication Successful',
            'Redirecting you to the right place...',
            redirectUrl
        )
    }

    const showLoadingState = (message, subMessage, duration = 2000) => {
        setLoading(true)
        setLoaderType('loading')
        setLoaderMessage(message)
        setLoaderSubMessage(subMessage)

        setTimeout(() => {
            setLoading(false)
        }, duration)
    }

    return {
        loading,
        loaderType,
        loaderMessage,
        loaderSubMessage,
        startRedirect,
        redirectBasedOnRole,
        showAuthLoader,
        showLoadingState,
        stopLoading: () => setLoading(false)
    }
}