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

    // All branches with full hospital + master admin info
    const branches = await prisma.branch.findMany({
      include: {
        hospital: true,
        masterAdmin: {
          select: { id: true, name: true, email: true, publicId: true, isVerified: true }
        },
        memberships: {
          where: { status: "APPROVED" },
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
                profile: { select: { profileImage: true, bloodType: true, gender: true } }
              }
            }
          }
        },
        _count: { select: { memberships: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // All users globally
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        publicId: true,
        isVerified: true,
        verificationDoc: true,
        createdAt: true,
        hospital: { select: { name: true } },
        branch: { select: { name: true } },
        profile: { select: { profileImage: true, bloodType: true, gender: true } },
        memberships: {
          select: {
            status: true,
            isPrimary: true,
            branch: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ branches, users }, { status: 200 });
  } catch (error) {
    console.error("GET_SUPERADMIN_DIRECTORY_ERROR", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
