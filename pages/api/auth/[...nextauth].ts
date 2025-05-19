import NextAuth, { AuthOptions, Session, User as NextAuthUser, Account, Profile } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: AuthOptions = {
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
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
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
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: '/login',         // Tu página personalizada de login
    verifyRequest: '/verify', // Tu página personalizada de verificación de email
    error: '/login', // Página de error personalizada
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: { user: NextAuthUser, account: Account | null, profile?: Profile, email?: { verificationRequest?: boolean }, credentials?: Record<string, unknown> }) {
      console.log('SignIn callback:', { user, account, profile, email, credentials })
      return true
    },
    async session({ session, user, token }: { session: Session, user?: NextAuthUser, token?: any }) {
      console.log('Session callback:', { session, user, token })
      return session
    },
    async jwt({ token, user, account, profile }: { token: any, user?: NextAuthUser, account?: Account | null, profile?: Profile }) {
      console.log('JWT callback:', { token, user, account, profile })
      return token
    },
  },
}

export default NextAuth(authOptions)