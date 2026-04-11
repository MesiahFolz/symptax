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
    const userId = id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified },
    });

    // If verified, send a notification email
    if (isVerified) {
       await sendVerificationApprovedEmail(user.email, user.name);
    }

    return NextResponse.json({ message: "User status updated", user });
  } catch (error) {
    console.error("VERIFY_ERROR:", error);
    return NextResponse.json({ message: "Error updating status" }, { status: 500 });
  }
}
