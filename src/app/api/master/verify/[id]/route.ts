import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendVerificationApprovedEmail } from "@/lib/mail";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "MASTER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { isVerified } = await req.json();
    const userIdToVerify = id;
    const masterAdminId = (session.user as any).id;

    const managedBranch = await prisma.branch.findUnique({
      where: { masterAdminId }
    });

    if (!managedBranch) {
      return NextResponse.json({ message: "No branch managed" }, { status: 400 });
    }

    const membership = await prisma.branchMembership.update({
      where: {
        userId_branchId: {
          userId: userIdToVerify,
          branchId: managedBranch.id
        }
      },
      data: { status: isVerified ? "APPROVED" : "REJECTED" },
      include: { user: true }
    });

    if (isVerified) {
       await prisma.user.update({
         where: { id: userIdToVerify },
         data: { isVerified: true }
       });
       await sendVerificationApprovedEmail(membership.user.email, membership.user.name);
    }

    return NextResponse.json({ message: "Membership status updated", membership });
  } catch (error) {
    console.error("VERIFY_ERROR:", error);
    return NextResponse.json({ message: "Error updating status" }, { status: 500 });
  }
}
