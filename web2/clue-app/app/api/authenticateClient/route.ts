import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Takes in the sessionId (provided to the client by Convex)
  const [sessionId, username] = await request.json();
  console.log(sessionId, username);

  if (sessionId && username) {
    // Set the session cookie with provided options
    const cookieStore = cookies();
    cookieStore.set("session-id", sessionId, {
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/", // Available throughout the site
      secure: true, // HTTPS only
      // httpOnly: true, // Inaccessible to JavaScript on the client
    });
    cookieStore.set("username", username, {
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/", // Available throughout the site
      secure: true, // HTTPS only
      // httpOnly: true, // Inaccessible to JavaScript on the client
    });

    return new NextResponse("Authentication successful", { status: 200 });
  }

  // Handle authentication failure
  return new NextResponse("Authentication failed", { status: 400 });
}
