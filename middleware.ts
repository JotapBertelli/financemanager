import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    if (req.nextauth.token) {
      if (
        req.nextUrl.pathname.startsWith('/login') ||
        req.nextUrl.pathname.startsWith('/register')
      ) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    const response = NextResponse.next()

    if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/admin')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/pricing', '/admin/login']
        const isPublicPath = publicPaths.some(path =>
          req.nextUrl.pathname.startsWith(path)
        )

        if (isPublicPath) {
          return true
        }

        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/pricing',
  ],
}

