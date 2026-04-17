import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "You must be logged in to become a Super Admin." }, { status: 401 });
    }

    const { email } = session.user;

    const user = await prisma.user.update({
      where: { email },
      data: { role: "SUPER_ADMIN" }
    });

    return NextResponse.json({ 
      message: "Successfully promoted to SUPER_ADMIN! Please log out and log back in for changes to take effect.", 
      user 
    }, { status: 200 });

  } catch (error) {
    console.error("DEBUG_MAKE_SUPERADMIN_ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
