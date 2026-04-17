import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generatePublicId } from "@/lib/utils/id";

export async function GET() {
  try {
    const email = "superadmin@symptax.com";
    
    let admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin) {
      const hashedPassword = await bcrypt.hash("superadmin123", 10);
      admin = await prisma.user.create({
        data: {
          name: "System Super Admin",
          email,
          password: hashedPassword,
          role: "SUPER_ADMIN",
          isVerified: true,
          publicId: generatePublicId(),
          profile: {
            create: {}
          }
        }
      });
      return NextResponse.json({ message: "Super Admin seeded successfully.", email: admin.email, password: "superadmin123" }, { status: 201 });
    }

    return NextResponse.json({ message: "Super Admin already exists.", email: admin.email }, { status: 200 });
  } catch (error: any) {
    console.error("SEED_ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
