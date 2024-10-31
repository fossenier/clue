import { NextRequest, NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Users can skip login / register when they have a session cookie
  if (
    request.cookies.get("session-id") &&
    request.cookies.get("username") &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/play", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
