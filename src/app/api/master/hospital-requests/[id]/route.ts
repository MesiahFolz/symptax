import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Only SUPER_ADMIN can approve hospital requests
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized. Global administrative privileges required." }, { status: 403 });
    }

    const { status, adminNotes } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ message: "Invalid status update" }, { status: 400 });
    }

    const hospitalRequest = await prisma.hospitalRequest.findUnique({
      where: { id },
    });

    if (!hospitalRequest) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    if (status === "APPROVED") {
      // 1. Create the Hospital
      const hospital = await prisma.hospital.create({
        data: {
          name: hospitalRequest.hospitalName,
        },
      });

      // 2. Create the Branch
      const branch = await prisma.branch.create({
        data: {
          name: hospitalRequest.branchName,
          address: hospitalRequest.branchAddress,
          hospitalId: hospital.id,
          masterAdminId: hospitalRequest.requesterId,
        },
      });

      // 3. Update the Requester to MASTER_ADMIN of this branch
      await prisma.user.update({
        where: { id: hospitalRequest.requesterId },
        data: {
          role: "MASTER_ADMIN",
          hospitalId: hospital.id,
          branchId: branch.id,
          isVerified: true, // Mark as verified since they are now a master admin
        },
      });

      // 4. Update request status
      await prisma.hospitalRequest.update({
        where: { id },
        data: { status: "APPROVED", adminNotes },
      });

      return NextResponse.json({ message: "Hospital and Branch created. User promoted to Master Admin." });
    } else {
      // REJECTED
      await prisma.hospitalRequest.update({
        where: { id },
        data: { status: "REJECTED", adminNotes },
      });
      return NextResponse.json({ message: "Request rejected." });
    }
  } catch (error: any) {
    console.error("APPROVAL_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
