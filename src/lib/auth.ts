import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      publicId: string;
      isVerified: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    role: string;
    publicId: string;
    isVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    publicId: string;
    isVerified: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) return null;

        if (!user.isVerified && user.role !== "MASTER_ADMIN") {
          throw new Error("ACCOUNT_PENDING_VERIFICATION");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          publicId: user.publicId,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.publicId = user.publicId;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.publicId = token.publicId;
        session.user.isVerified = token.isVerified;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
