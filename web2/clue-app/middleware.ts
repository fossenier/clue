import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session-id")?.value;
  const username = request.cookies.get("username")?.value;
  const hasSession = sessionId && username;

  // Redirect logged-in users away from `/login` and `/register`
  if (
    hasSession &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/games", request.url));
  }

  // Redirect unauthenticated users to `/login` unless they are accessing `/login` or `/register`
  if (
    !hasSession &&
    request.nextUrl.pathname !== "/login" &&
    request.nextUrl.pathname !== "/register"
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
