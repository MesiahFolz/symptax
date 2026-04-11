import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generatePublicId } from "@/lib/utils/id";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, verificationDoc } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a unique Public ID
    let publicId = generatePublicId();
    let isIdUnique = false;
    let attempts = 0;

    // Ensure collision-free ID
    while (!isIdUnique && attempts < 10) {
      const check = await prisma.user.findUnique({ where: { publicId } });
      if (!check) {
        isIdUnique = true;
      } else {
        publicId = generatePublicId();
        attempts++;
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "PATIENT",
        publicId,
        isVerified: false,
        verificationDoc: verificationDoc || null,
        // Automatically create a profile for every new user
        profile: {
          create: {}
        }
      },
      include: {
        profile: true
      }
    });

    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          publicId: user.publicId,
          isVerified: user.isVerified
        } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("REGISTRATION_ERROR:", error);
    
    let errorMessage = "Something went wrong during registration.";
    if (error.code === "P2002") {
      errorMessage = "Database constraint error. Please try again.";
    } else if (error.message?.includes("Can't reach database")) {
      errorMessage = "Could not connect to the database. Please check your credentials.";
    }

    return NextResponse.json(
      { message: errorMessage, error: error.message },
      { status: 500 }
    );
  }
}
