import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const medications = await prisma.medication.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { startDate: "desc" }
    });

    return NextResponse.json({ medications });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching medications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const userId = (session.user as any).id;

    const medication = await prisma.medication.create({
      data: {
        userId,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        startDate: new Date(data.startDate),
        status: data.status || "CURRENT",
        endDate: data.endDate ? new Date(data.endDate) : null
      }
    });

    return NextResponse.json({ message: "Medication added", medication });
  } catch (error: any) {
    console.error("MEDICATION_CREATE_ERROR:", error);
    return NextResponse.json({ message: "Error adding medication" }, { status: 500 });
  }
}
