import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { hospitalName, branchName, branchAddress, documentUrl } = await req.json();

    if (!hospitalName || !branchName || !branchAddress) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const request = await prisma.hospitalRequest.create({
      data: {
        requesterId: (session.user as any).id,
        hospitalName,
        branchName,
        branchAddress,
        documentUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json({ message: "Hospital branch request submitted successfully", request }, { status: 201 });
  } catch (error: any) {
    console.error("HOSPITAL_REQUEST_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.hospitalRequest.findMany({
      where: { requesterId: (session.user as any).id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
