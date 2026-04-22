import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generatePublicId } from "@/lib/utils/id";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please fill in all fields." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "This email is already associated with an account." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a unique Public ID
    let publicId = generatePublicId();
    let isIdUnique = false;
    let attempts = 0;

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
        role: "PATIENT", // Everyone starts as PATIENT, role changes after verification
        publicId,
        isVerified: false,
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
        message: "Account created successfully!", 
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
    console.error("REGISTRATION_FAILURE_DETAIL:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    let errorMessage = "Something went wrong during registration.";
    if (error.code === "P2002") {
      errorMessage = "This email or public ID is already registered.";
    } else if (error.message?.includes("Can't reach database") || error.code === "P2021") {
      errorMessage = "Database connection failed. Please try again later.";
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
