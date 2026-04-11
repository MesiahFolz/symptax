import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;

    // Fetch incoming requests
    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        sender: {
          select: { name: true, publicId: true, role: true }
        }
      }
    });

    // Fetch accepted connections (either as sender or receiver)
    const connectionsA = await prisma.friendRequest.findMany({
      where: { senderId: userId, status: "ACCEPTED" },
      include: {
        receiver: {
          select: { id: true, name: true, publicId: true, role: true, isVerified: true }
        }
      }
    });

    const connectionsB = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "ACCEPTED" },
      include: {
        sender: {
          select: { id: true, name: true, publicId: true, role: true, isVerified: true }
        }
      }
    });

    // Flatten connections
    const connections = [
      ...connectionsA.map(c => c.receiver),
      ...connectionsB.map(c => c.sender)
    ];

    return NextResponse.json({ requests, connections });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching network" }, { status: 500 });
  }
}
