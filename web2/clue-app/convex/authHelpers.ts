"use server";

import { compareSync } from "bcrypt-ts";
import { ConvexError } from "convex/values";

import { QueryCtx } from "./_generated/server";

// Checks to see if the username meets system requirements
export async function validateUsername(username: string) {
  var valid = true;
  // Ensure username length
  if (username.length < 6) {
    valid = false;
  }
  return valid;
}

// Checks to see if the username is already in the system
export async function fetchUser(ctx: QueryCtx, username: string) {
  if (!validateUsername(username)) {
    return null;
  }
  const existingUser = await ctx.db
    .query("user")
    .withIndex("by_username")
    .filter((q) => q.eq(q.field("username"), username))
    .first();
  return existingUser ? existingUser : null;
}

// Checks to see if a session is valid (username in session,
// and sessionId is a valid hash of the user's Id)
export async function validateSession(
  ctx: QueryCtx,
  sessionId: string,
  username: string
) {
  const existingUser = await fetchUser(ctx, username);

  // Bad cookies if the username isn't valid
  if (!existingUser) {
    throw new ConvexError(
      "Error authenticating client, please try logging in again."
    );
  }

  // Check the session ID against the user's ID
  return compareSync(existingUser._id, sessionId) ? existingUser : null;
}
