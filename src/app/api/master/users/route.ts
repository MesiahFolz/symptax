import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "MASTER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const userId = (session.user as any).id;

    const managedBranch = await prisma.branch.findUnique({
      where: { masterAdminId: userId },
      select: { id: true }
    });

    if (!managedBranch) {
      return NextResponse.json({ memberships: [] }, { status: 200 });
    }

    const memberships = await prisma.branchMembership.findMany({
      where: { branchId: managedBranch.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            publicId: true,
            isVerified: true,
            verificationDoc: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ memberships });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching memberships" }, { status: 500 });
  }
}
