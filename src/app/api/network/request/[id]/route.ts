import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { accept } = await req.json();
    const requestId = params.id;
    const userId = (session.user as any).id;

    const request = await prisma.friendRequest.findFirst({
      where: { id: requestId, receiverId: userId }
    });

    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    if (accept) {
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" }
      });
    } else {
      await prisma.friendRequest.delete({
        where: { id: requestId }
      });
    }

    return NextResponse.json({ message: accept ? "Request Accepted" : "Request Rejected" });
  } catch (error) {
    return NextResponse.json({ message: "Error processing request" }, { status: 500 });
  }
}
