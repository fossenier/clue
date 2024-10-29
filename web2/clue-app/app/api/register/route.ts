import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Takes in the sessionID (provided from the client BY Convex)
  const sessionID = await request.json();

  if (sessionID) {
    // Set the session cookie with provided options
    const cookieStore = cookies();
    cookieStore.set("session-id", sessionID, {
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/", // Available throughout the site
      secure: true, // HTTPS only
      httpOnly: true, // Inaccessible to JavaScript on the client
    });

    // Redirect to /play
    // return NextResponse.redirect(new URL("/play", request.url), 303);
    return new NextResponse("Registration successful", { status: 200 });
  }

  // Handle registration failure
  return new NextResponse("Registration failed", { status: 400 });
}
