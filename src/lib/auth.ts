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
      image: string;
      hospitalId?: string | null;
      branchId?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    role: string;
    publicId: string;
    isVerified: boolean;
    image: string;
    hospitalId?: string | null;
    branchId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    publicId: string;
    isVerified: boolean;
    image: string;
    hospitalId?: string | null;
    branchId?: string | null;
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
        if (credentials?.email === "guest" && credentials?.password === "guest") {
          return {
            id: "guest-session",
            email: "guest@symptax.io",
            name: "Guest Explorer",
            role: "GUEST",
            publicId: "ST-GUEST",
            isVerified: false,
            image: "",
            hospitalId: null,
            branchId: null,
          };
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { profile: true },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) return null;

        // All users can log in — verification unlocks additional features
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          publicId: user.publicId,
          isVerified: user.isVerified,
          image: user.profile?.profileImage || '',
          hospitalId: (user as any).hospitalId,
          branchId: (user as any).branchId,
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
        token.image = (user as any).image;
        token.hospitalId = (user as any).hospitalId;
        token.branchId = (user as any).branchId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.publicId = token.publicId;
        session.user.isVerified = token.isVerified;
        session.user.image = token.image as string;
        session.user.hospitalId = token.hospitalId as string;
        session.user.branchId = token.branchId as string;
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
