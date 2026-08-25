import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Email + password auth (PRD §3.1). JWT session strategy - role is
// embedded in the token so every server component/route/middleware can
// read `session.user.role` without a DB round trip. Role-gating on
// /dashboard, /instructor, /admin still needs an explicit server-side
// check per route (TRD §2, §5) - this file only establishes identity.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  // Required for any self-hosted (non-Vercel) production deployment - the
  // TRD's target (DigitalOcean App Platform/Droplet) is exactly that.
  // Without this, Auth.js rejects every request in production mode with
  // "UntrustedHost", which silently breaks session reads and sign-in
  // (confirmed via the prod server logs, not a hypothesis).
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
