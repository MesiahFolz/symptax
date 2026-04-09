import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET notifications for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST a new notification (Doctor only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "DOCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId, message } = await req.json();

    if (!userId || !message) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
