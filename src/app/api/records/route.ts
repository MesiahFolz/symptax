import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    let records;

    if (userRole === "DOCTOR") {
      if (patientId) {
        records = await prisma.medicalRecord.findMany({
          where: { patientId },
          orderBy: { createdAt: "desc" },
        });
      } else {
        records = await prisma.medicalRecord.findMany({
          orderBy: { createdAt: "desc" },
          include: { patient: { select: { name: true, email: true } } },
        });
      }
    } else {
      // Patients can only fetch their own records
      records = await prisma.medicalRecord.findMany({
        where: { patientId: userId },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "DOCTOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, content, type, patientId, isPinned, requiresAction, tags } = await req.json();

    if (!title || !patientId || !type) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        title,
        content,
        type, // "DIAGNOSIS" | "PRESCRIPTION" | "NOTE" | "ALERT"
        patientId,
        isPinned: isPinned || false,
        requiresAction: requiresAction || false,
        tags,
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
