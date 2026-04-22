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

    const { id } = await context.params;
    const { action } = await req.json(); // "APPROVE" or "DELETE"

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      await prisma.user.update({
        where: { id },
        data: { 
          isVerified: true,
          role: user.requestedRole || "PATIENT" // Promote to the requested role upon verification
        },
      });
      return NextResponse.json({ message: `User verified and promoted to ${user.requestedRole || "PATIENT"}` }, { status: 200 });
    } else if (action === "DELETE") {
       // Only allow deleting non-Super Admin users for safety
       if (user.role === "SUPER_ADMIN") {
         return NextResponse.json({ message: "Cannot delete a Super Admin" }, { status: 403 });
       }

       await prisma.user.delete({
         where: { id },
       });
       return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("PATCH_SUPERADMIN_USER_VERIFY_ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
