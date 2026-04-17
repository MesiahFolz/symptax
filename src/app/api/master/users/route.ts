import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all members of the managed branch with full profile info
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "MASTER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const masterAdminId = (session.user as any).id;

    const managedBranch = await prisma.branch.findUnique({
      where: { masterAdminId },
      select: { id: true, name: true }
    });

    if (!managedBranch) {
      return NextResponse.json({ memberships: [], branch: null }, { status: 200 });
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
            profile: {
              select: {
                profileImage: true,
                bloodType: true,
                gender: true,
                height: true,
                weight: true,
                dob: true,
                address: true,
              }
            },
            records: {
              orderBy: { createdAt: "desc" },
              take: 3,
              select: { id: true, title: true, type: true, createdAt: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ memberships, branch: managedBranch });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching memberships" }, { status: 500 });
  }
}
