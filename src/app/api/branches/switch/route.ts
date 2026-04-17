import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { branchId } = await req.json();
    const userId = (session.user as any).id;

    // Check if membership is explicitly APPROVED
    const membership = await prisma.branchMembership.findUnique({
      where: { userId_branchId: { userId, branchId } }
    });

    if (!membership || membership.status !== "APPROVED") {
      return NextResponse.json({ message: "You are not an approved member of this branch." }, { status: 403 });
    }

    // Step 1: Remove isPrimary from all other memberships for this user
    await prisma.branchMembership.updateMany({
      where: { userId },
      data: { isPrimary: false }
    });

    // Step 2: Set new branch as primary
    await prisma.branchMembership.update({
      where: { userId_branchId: { userId, branchId } },
      data: { isPrimary: true }
    });

    // Step 3: Update actual User.branchId so legacy queries still work organically globally!
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { branchId },
      include: { branch: true } // get branch details to pass back
    });

    return NextResponse.json({ 
      message: `Successfully switched context to ${updatedUser.branch?.name}`,
      branch: updatedUser.branch
    }, { status: 200 });

  } catch (error) {
    console.error("SWITCH_BRANCH_ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
