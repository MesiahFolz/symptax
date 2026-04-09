import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Allow unauthenticated access to the main landing page, login, and register
      if (
        req.nextUrl.pathname === "/" ||
        req.nextUrl.pathname.startsWith("/login") ||
        req.nextUrl.pathname.startsWith("/register")
      ) {
        return true;
      }
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/prescriptions", "/api/messages", "/api/chat"],
};
