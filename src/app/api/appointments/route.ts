import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "DOCTOR") {
      return NextResponse.json({ message: "Unauthorized. Doctors only." }, { status: 401 });
    }

    const { patientId, startTime, endTime, notes } = await req.json();

    if (!patientId || !startTime) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const doctorId = (session.user as any).id;
    const branchId = (session.user as any).branchId;

    if (!branchId) {
      return NextResponse.json({ message: "Doctor not assigned to a branch" }, { status: 400 });
    }

    const appointment = await (prisma as any).appointment.create({
      data: {
        doctorId,
        patientId,
        branchId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        notes,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Appointment scheduled", appointment }, { status: 201 });
  } catch (error: any) {
    console.error("APPOINTMENT_CREATE_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const branchId = (session.user as any).branchId;

    let appointments;

    if (userRole === "SUPER_ADMIN") {
      appointments = await (prisma as any).appointment.findMany({
         include: { doctor: { select: { name: true } }, patient: { select: { name: true } } },
         orderBy: { startTime: "desc" }
      });
    } else if (userRole === "MASTER_ADMIN") {
      appointments = await (prisma as any).appointment.findMany({
        where: { branchId },
        include: { doctor: { select: { name: true } }, patient: { select: { name: true } } },
        orderBy: { startTime: "desc" }
      });
    } else if (userRole === "DOCTOR") {
      appointments = await (prisma as any).appointment.findMany({
        where: { doctorId: userId },
        include: { patient: { select: { name: true } } },
        orderBy: { startTime: "desc" }
      });
    } else {
      // PATIENT
      appointments = await (prisma as any).appointment.findMany({
        where: { patientId: userId },
        include: { doctor: { select: { name: true } } },
        orderBy: { startTime: "desc" }
      });
    }

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
