import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: (session.user as any).id }
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const userId = (session.user as any).id;

    // Update User Name
    if (data.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name }
      });
    }

    // Update or Create Profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        height: data.height,
        weight: data.weight,
        bloodType: data.bloodType,
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : null,
        address: data.address
      },
      create: {
        userId,
        height: data.height,
        weight: data.weight,
        bloodType: data.bloodType,
        gender: data.gender,
        dob: data.dob ? new Date(data.dob) : null,
        address: data.address
      }
    });

    return NextResponse.json({ message: "Profile updated", profile });
  } catch (error: any) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return NextResponse.json({ message: "Error updating profile" }, { status: 500 });
  }
}
