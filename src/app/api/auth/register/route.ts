import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generatePublicId } from "@/lib/utils/id";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, verificationDoc, profileImage, hospitalName, branchName, branchAddress } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Server-side email domain validation
    const domain = email.split("@")[1]?.toLowerCase();
    const isMasterAdmin = role === "MASTER_ADMIN" || email === "master@symptax.com";
    
    if (isMasterAdmin) {
      if (domain !== "symptax.com") {
        return NextResponse.json({ message: "Master Admin must use @symptax.com email domain." }, { status: 400 });
      }
      if (!hospitalName || !branchName || !branchAddress) {
        return NextResponse.json({ message: "Master Admins must provide Hospital and Branch details." }, { status: 400 });
      }
    } else {
      if (domain !== "gmail.com" && domain !== "email.com") {
        return NextResponse.json({ message: "Email domain must be @gmail.com or @email.com" }, { status: 400 });
      }
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
        // For Master Admins, they start as MASTER_ADMIN but have no Branch.
        // Wait, if they don't have a branch, `isVerified` is false.
        role: role || "PATIENT",
        publicId,
        isVerified: false,
        verificationDoc: verificationDoc || null,
        profile: {
          create: {
            profileImage: profileImage || null
          }
        }
      },
      include: {
        profile: true
      }
    });

    if (role === "MASTER_ADMIN") {
       await prisma.hospitalRequest.create({
         data: {
           requesterId: user.id,
           hospitalName,
           branchName,
           branchAddress,
           documentUrl: verificationDoc,
           status: "PENDING"
         }
       });
    }

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
    console.error("REGISTRATION_FAILURE_DETAIL:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    let errorMessage = "Something went wrong during registration.";
    if (error.code === "P2002") {
      errorMessage = "This email or public ID is already registered.";
    } else if (error.message?.includes("Can't reach database") || error.code === "P2021") {
      errorMessage = "Database connection failed. Please check your database connection.";
    } else if (error.message?.includes("Profile")) {
      errorMessage = "Internal error creating user profile. Please try again.";
    }

    return NextResponse.json(
      { message: errorMessage, error: error.message },
      { status: 500 }
    );
  }
}
