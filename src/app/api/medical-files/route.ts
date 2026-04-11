import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const files = await prisma.medicalFile.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching files" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, url, type } = await req.json();
    const userId = (session.user as any).id;

    const file = await prisma.medicalFile.create({
      data: {
        userId,
        name,
        fileUrl: url,
        fileType: type || "IMAGE"
      }
    });

    return NextResponse.json({ message: "File registered", file });
  } catch (error) {
    return NextResponse.json({ message: "Error registering file" }, { status: 500 });
  }
}
