import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { status, adminNotes } = await req.json();
    const { id } = await context.params;

    const request = await prisma.hospitalRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    if (status === "APPROVED" && request.status !== "APPROVED") {
      // 1. Create Hospital
      const hospital = await prisma.hospital.create({
        data: {
          name: request.hospitalName,
        }
      });

      // 2. Create Branch
      const branch = await prisma.branch.create({
        data: {
          name: request.branchName,
          address: request.branchAddress,
          hospitalId: hospital.id,
          masterAdminId: request.requesterId,
        }
      });

      // 3. Update User (elevate role to MASTER_ADMIN & assign branch)
      await prisma.user.update({
        where: { id: request.requesterId },
        data: {
          role: "MASTER_ADMIN",
          isVerified: true,
          hospitalId: hospital.id,
          branchId: branch.id
        }
      });

      // 4. Insert Primary BranchMembership for Master Admin
      await prisma.branchMembership.create({
        data: {
          userId: request.requesterId,
          branchId: branch.id,
          status: "APPROVED",
          role: "MASTER_ADMIN",
          isPrimary: true
        }
      });
    }

    const updatedRequest = await prisma.hospitalRequest.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || undefined,
      }
    });

    return NextResponse.json({ request: updatedRequest }, { status: 200 });

  } catch (error) {
    console.error("HTTP_PATCH_HOSPITAL_REQUEST_ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
