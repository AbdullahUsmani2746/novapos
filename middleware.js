import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const { token } = req.nextauth

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return Response.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Accounting routes
    if (pathname.startsWith("/accounting")) {
      if (!["ADMIN", "ACCOUNTANT", "MANAGER"].includes(token?.role)) {
        return Response.redirect(new URL("/unauthorized", req.url))
      }
    }

    // POS routes
    if (pathname.startsWith("/pos")) {
      if (!["ADMIN", "MANAGER", "CASHIER","ACCOUNTANT"].includes(token?.role)) {
        return Response.redirect(new URL("/unauthorized", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/","/dashboard/:path*", "/admin/:path*", "/accounting/:path*", "/pos/:path*"]
}