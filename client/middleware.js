// middleware.js with debugging
import { NextResponse } from 'next/server'

export function middleware(request) {
    const path = request.nextUrl.pathname

    // Check for both cookie names to match backend expectations
    const accessToken = request.cookies.get('accessToken')
    const authToken = request.cookies.get('authToken')
    const rolesCookie = request.cookies.get('roles')

    let roles = []
    try {
        roles = rolesCookie ? JSON.parse(rolesCookie.value) : []
    } catch (e) {
        // Silent fail
    }

    // User is authenticated if either token exists (backend prefers accessToken)
    const isAuthenticated = !!(accessToken || authToken)

    const isAdminRoute = path.startsWith('/admin')
    const isSellerRoute = path.startsWith('/seller/') // Fixed: Added trailing slash
    const isProtectedRoute = path.startsWith('/protected')
    const isAuthRoute = path === '/signin' || path === '/signup'
    const isHomePage = path === '/'

    if (isHomePage && isAuthenticated && roles.includes('admin')) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    if (isAuthRoute && isAuthenticated && roles.length > 0) {
        if (roles.includes('admin')) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        } else if (roles.includes('seller')) {
            return NextResponse.redirect(new URL('/seller/dashboard', request.url))
        } else {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Protect admin routes
    if (isAdminRoute) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/signin', request.url))
        }
        if (!roles.includes('admin')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Protect seller routes
    if (isSellerRoute) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/signin', request.url))
        }
        if (!roles.includes('seller')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Check for dashboard redirect with partial auth
    if (path === '/dashboard' && !isAuthenticated) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Match all paths except static files and api routes
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico|.*\\.webp|.*\\.woff|.*\\.woff2|.*\\.ttf|.*\\.otf|.*\\.eot|.*\\.css|.*\\.js|.*\\.json|.*\\.xml|.*\\.txt|test-cart).*)'
    ]
}
