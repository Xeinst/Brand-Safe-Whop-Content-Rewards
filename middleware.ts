import { NextRequest, NextResponse } from 'next/server'
import { canAccessDashboard, canAccessExperience } from './lib/whop-authz'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Extract route parameters
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Dashboard routes - require admin/owner access
  if (pathname.startsWith('/dashboard/')) {
    const companyId = pathSegments[1] // /dashboard/[companyId]
    
    if (!companyId) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    // Get user from request (you'll need to implement this based on your auth system)
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const hasAccess = await canAccessDashboard(user, companyId)
    
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    return NextResponse.next()
  }
  
  // Experience routes - require active membership
  if (pathname.startsWith('/experiences/')) {
    const experienceId = pathSegments[1] // /experiences/[experienceId]
    
    if (!experienceId) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const hasAccess = await canAccessExperience(user, experienceId)
    
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

// Helper function to extract user from request
async function getUserFromRequest(request: NextRequest) {
  // This should be implemented based on your authentication system
  // For now, returning a mock user - replace with actual auth logic
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return null
  }
  
  // Mock user - replace with actual JWT verification or session lookup
  return {
    id: 'user-123',
    role: 'owner',
    companyId: 'company-123'
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/experiences/:path*'
  ]
}
