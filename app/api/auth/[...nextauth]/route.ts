import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import type { User } from "@prisma/client"

const prisma = new PrismaClient()

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT Callback:", { token, user, account })
      if (user && user.id) {
        token.id = user.id;
      }
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback:", { session, token })
      if (session.user) {
        if (token?.id) {
          session.user.id = String(token.id);
        } else if (session.user.email) {
          const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
          session.user.id = dbUser ? dbUser.id : "";
        } else {
          session.user.id = "";
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn Callback:", { user, account, profile })
      if (!user.email) {
        return false
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect Callback:", { url, baseUrl })
      // Asegurarse de que la URL base sea HTTPS en producción
      const baseUrlWithProtocol = process.env.NODE_ENV === "production" 
        ? baseUrl.replace(/^http:/, 'https:')
        : baseUrl;
      
      if (url.startsWith("/")) return `${baseUrlWithProtocol}${url}`
      else if (new URL(url).origin === baseUrlWithProtocol) return url
      return baseUrlWithProtocol
    },
  },
  debug: process.env.NODE_ENV === "development", // Solo activar debug en desarrollo
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 