import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { verificationDoc, requestedRole } = await req.json();

    if (!verificationDoc) {
      return NextResponse.json(
        { message: "Please upload your ID document." },
        { status: 400 }
      );
    }

    const validRoles = ["PATIENT", "DOCTOR", "MASTER_ADMIN"];
    if (!validRoles.includes(requestedRole)) {
      return NextResponse.json(
        { message: "Invalid role selected." },
        { status: 400 }
      );
    }

    // Save the verification document to the user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        verificationDoc,
      },
    });

    // Create a notification for all SUPER_ADMINs
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
    });

    for (const admin of superAdmins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `New verification request from ${session.user.name} (${session.user.email}) for role: ${requestedRole}. Document: ${verificationDoc}`,
        },
      });
    }

    return NextResponse.json(
      { message: "Verification request submitted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("VERIFICATION_ERROR:", error.message);
    return NextResponse.json(
      { message: "Failed to submit verification request." },
      { status: 500 }
    );
  }
}
