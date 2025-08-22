import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de rotas que requerem autenticação
const protectedRoutes = [
  '/dashboard',
  '/tickets',
  '/contacts',
  '/users',
  '/queues',
  '/connections',
  '/reports',
  '/settings',
]

// Lista de rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar se a rota é protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Verificar se a rota é pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Verificar token de autenticação
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // Se é uma rota protegida e não tem token, redirecionar para login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Se é uma rota pública e tem token, redirecionar para dashboard
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Adicionar headers de segurança
  const response = NextResponse.next()
  
  // Headers de segurança
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}