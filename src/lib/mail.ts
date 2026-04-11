import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: "SympTax Health <onboarding@resend.dev>", // Once verified, use info@symptax.com
      to: email,
      subject: "Reset your SympTax Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e293b;">Password Reset Request</h2>
          <p>We received a request to reset your password for your SympTax Health account.</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 0.875rem;">If you did not request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 0.75rem;">© 2026 SympTax Health Platform</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("RESEND_ERROR:", error);
    return { success: false, error };
  }
};

export const sendVerificationApprovedEmail = async (email: string, name: string) => {
  try {
    await resend.emails.send({
      from: "SympTax Health <onboarding@resend.dev>",
      to: email,
      subject: "Account Verified - SympTax",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #059669;">Congratulations ${name}!</h2>
          <p>Your account has been officially verified by the SympTax Master Admin.</p>
          <p>You now have full access to all clinical features of the platform.</p>
          <div style="margin: 20px 0;">
             <a href="${process.env.NEXTAUTH_URL}/dashboard" style="color: #2563eb; font-weight: bold;">Go to Dashboard →</a>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("RESEND_ERROR:", error);
    return { success: false, error };
  }
};
