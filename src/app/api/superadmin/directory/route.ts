import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const branches = await prisma.branch.findMany({
      include: {
        hospital: true,
        masterAdmin: { select: { name: true, email: true } },
        _count: { select: { users: true, memberships: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        publicId: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ branches, users }, { status: 200 });
  } catch (error) {
    console.error("GET_SUPERADMIN_DIRECTORY_ERROR", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
