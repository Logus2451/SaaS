import { NextResponse, type NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth/auth"

export async function middleware(request: NextRequest) {
  // Get auth token from cookies
  const token = request.cookies.get("auth-token")?.value

  // Verify token and get user
  const user = token ? verifyToken(token) : null

  // Define route patterns
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth")
  const isSuperAdminRoute = request.nextUrl.pathname.startsWith("/super-admin")
  const isHotelAdminRoute = request.nextUrl.pathname.startsWith("/hotel-admin")
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/hotels/") ||
    request.nextUrl.pathname.startsWith("/book/")

  // If user is not logged in and trying to access protected routes
  if (!user && (isSuperAdminRoute || isHotelAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If user is logged in, check role-based access
  if (user && (isSuperAdminRoute || isHotelAdminRoute)) {
    // Super admin routes - only super_admin role
    if (isSuperAdminRoute && user.role !== "super_admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/unauthorized"
      return NextResponse.redirect(url)
    }

    // Hotel admin routes - hotel_owner or hotel_staff roles
    if (isHotelAdminRoute && !["hotel_owner", "hotel_staff"].includes(user.role)) {
      const url = request.nextUrl.clone()
      url.pathname = "/unauthorized"
      return NextResponse.redirect(url)
    }
  }

  // If user is logged in and trying to access auth routes
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
