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

    // 2. Dashboard Access
    if (path.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
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
