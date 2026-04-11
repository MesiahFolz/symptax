import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // For security, don't reveal if user exists. 
      // Just say "If an account exists, an email has been sent."
      return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Delete existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Save new token
    await prisma.passwordResetToken.create({
      data: { email, token, expires }
    });

    // Send email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: "Reset link sent successfully" });
  } catch (error: any) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return NextResponse.json({ message: "Error sending reset link" }, { status: 500 });
  }
}
