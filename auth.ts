import NextAuth, { type User } from "next-auth"
import Discord from "next-auth/providers/discord"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: number
      role: string
      username?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: number | string
    role?: string
    username?: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: number
    role?: string
    username?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // @ts-expect-error - PrismaAdapter has strict types while Prisma generated types might slightly differ
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET || "infinity-store-secret-key-2026-super-secure",
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
    newUser: '/register'
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.usernameOrEmail || !credentials?.password) return null

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.usernameOrEmail as string },
              { username: credentials.usernameOrEmail as string }
            ]
          }
        })

        if (!user || !user.password) return null

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (passwordsMatch) {
          return { ...user, id: user.id.toString() } as User
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id)
        token.role = user.role
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        // @ts-expect-error - NextAuth types id as string, but Prisma uses Int
        session.user.id = token.id as number
        session.user.role = token.role as string
        session.user.username = token.username as string | undefined
      }
      return session
    }
  }
})
