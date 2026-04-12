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

    const doctorId = (session.user as any).id;

    // Get patients who have an accepted connection with this doctor
    const acceptedRequests = await prisma.friendRequest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: doctorId },
          { receiverId: doctorId },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const connectedUserIds = acceptedRequests.map((conn: { senderId: string; receiverId: string }) => 
      conn.senderId === doctorId ? conn.receiverId : conn.senderId
    );

    const patients = await prisma.user.findMany({
      where: { 
        id: { in: connectedUserIds },
        role: "PATIENT" 
      },
      select: { id: true, name: true, email: true, publicId: true },
    });

    return NextResponse.json({ patients }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
