import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Super Admin Protection
    if (path.startsWith("/api/master/hospital-requests") && token?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 2. Guest Restrictions
    const isGuest = token?.role === "GUEST";
    const corePages = ["/dashboard/medical-history", "/dashboard/medicines", "/dashboard/ai-chat", "/dashboard/profile", "/dashboard"];
    const isCorePage = corePages.some(cp => path === cp || path === cp + "/");
    
    if (isGuest && path.startsWith("/dashboard") && !isCorePage) {
       return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/master/:path*",
    "/api/hospital-requests/:path*",
    "/api/appointments/:path*",
    "/api/messages/:path*",
  ],
};
