import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "DOCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const patients = await prisma.user.findMany({
      where: { role: "PATIENT" },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ patients }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
