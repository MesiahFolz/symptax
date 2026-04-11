import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) return NextResponse.json({ message: "ID required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { publicId },
      select: {
        id: true,
        name: true,
        publicId: true,
        role: true,
        isVerified: true
      }
    });

    if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Don't search for self
    if (user.id === (session.user as any).id) {
       return NextResponse.json({ message: "Cannot search for yourself" }, { status: 400 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ message: "Search error" }, { status: 500 });
  }
}
