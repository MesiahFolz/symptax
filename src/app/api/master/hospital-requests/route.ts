import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const requests = await prisma.hospitalRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching requests" }, { status: 500 });
  }
}
