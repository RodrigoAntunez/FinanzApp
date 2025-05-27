import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      // Permitir acceso a rutas de API de autenticación
      if (req.nextUrl.pathname.startsWith('/api/auth')) {
        return true;
      }
      return !!token;
    },
  },
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - public (archivos públicos)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|public).*)",
  ],
} 