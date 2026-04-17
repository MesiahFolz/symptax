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
    if (!branchId) {
      return NextResponse.json({ message: "Branch ID required" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role || "PATIENT";

    // Create a pending membership mapping
    const membership = await prisma.branchMembership.create({
      data: {
        userId,
        branchId,
        role: role,
        status: "PENDING",
      }
    });

    return NextResponse.json({ message: "Membership request submitted.", membership }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: "You have already requested to join this branch." }, { status: 400 });
    }
    console.error("POST_MEMBERSHIP_ERROR", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
