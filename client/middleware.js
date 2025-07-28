// middleware.js with debugging
import { NextResponse } from 'next/server'

export function middleware(request) {
  const path = request.nextUrl.pathname
  
  const authToken = request.cookies.get('authToken')
  const rolesCookie = request.cookies.get('roles')  
  let roles = []
  try {
    roles = rolesCookie ? JSON.parse(rolesCookie.value) : []
  } catch (e) {
    // Silent fail
  }
  
  const isAuthenticated = !!authToken
  
  const isAdminRoute = path.startsWith('/admin')
  const isSellerRoute = path.startsWith('/seller')
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