import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { receiverId, type } = await req.json();
    const senderId = (session.user as any).id;

    if (senderId === receiverId) {
      return NextResponse.json({ message: "Self-connection not allowed" }, { status: 400 });
    }

    // Check if request already exists
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existing) {
       return NextResponse.json({ message: "Connection already exists or pending" }, { status: 400 });
    }

    const request = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING"
      }
    });

    // For simplicity, we use FriendRequest model for both. 
    // If doctor, we might add logic later for DoctorInvitation.

    return NextResponse.json({ message: "Request sent", request });
  } catch (error) {
    console.error("REQUEST_ERROR:", error);
    return NextResponse.json({ message: "Error sending request" }, { status: 500 });
  }
}
