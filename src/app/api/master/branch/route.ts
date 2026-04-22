import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "MASTER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { branchName, branchAddress, hospitalName } = await req.json();

    if (!branchName || !hospitalName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const masterAdminId = (session.user as any).id;

    // Check if they already have a branch
    const existingBranch = await prisma.branch.findUnique({
      where: { masterAdminId }
    });

    if (existingBranch) {
      return NextResponse.json({ message: "You have already created a branch" }, { status: 400 });
    }

    // 1. Create or find Hospital
    // For now, let's just create a new one for each Master Admin for simplicity
    // unless they already have a hospitalId assigned.
    let hospitalId = (session.user as any).hospitalId;

    if (!hospitalId) {
      const hospital = await prisma.hospital.create({
        data: {
          name: hospitalName,
        }
      });
      hospitalId = hospital.id;
    }

    // 2. Create Branch
    const newBranch = await prisma.branch.create({
      data: {
        name: branchName,
        address: branchAddress,
        hospitalId: hospitalId,
        masterAdminId: masterAdminId
      }
    });

    // 3. Update User to link to this branch and hospital
    await prisma.user.update({
      where: { id: masterAdminId },
      data: {
        branchId: newBranch.id,
        hospitalId: hospitalId
      }
    });

    return NextResponse.json({ message: "Branch created successfully", branch: newBranch }, { status: 201 });
  } catch (error: any) {
    console.error("CREATE_BRANCH_ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
