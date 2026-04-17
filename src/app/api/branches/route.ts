import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const branches = await prisma.branch.findMany({
      include: {
        hospital: true,
        masterAdmin: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const memberships = await prisma.branchMembership.findMany({
      where: { userId: (session.user as any).id }
    });

    return NextResponse.json({ branches, memberships }, { status: 200 });
  } catch (error) {
    console.error("GET_BRANCHES_ERROR", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
