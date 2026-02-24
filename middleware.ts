import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Se o usuário está autenticado e tenta acessar páginas de auth, redireciona
    if (req.nextauth.token) {
      if (
        req.nextUrl.pathname.startsWith('/login') ||
        req.nextUrl.pathname.startsWith('/register')
      ) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Páginas públicas (não precisa de autenticação)
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password']
        const isPublicPath = publicPaths.some(path =>
          req.nextUrl.pathname.startsWith(path)
        )

        if (isPublicPath) {
          return true
        }

        // Para todas as outras rotas, verifica se o usuário está autenticado
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
}

