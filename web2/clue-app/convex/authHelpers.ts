import { compareSync } from 'bcrypt-ts';
import { ConvexError } from 'convex/values';

import { QueryCtx } from './_generated/server';

export async function validateUser(
  ctx: QueryCtx,
  sessionId: string,
  username: string
) {
  console.log("validateUser");
  // Validate username requirements
  if (username.length < 6) {
    throw new ConvexError(
      "Error authenticating client, please try logging in again."
    );
  }

  // Find the existing user
  const existingUser = await ctx.db
    .query("user")
    .withIndex("by_username")
    .filter((q) => q.eq(q.field("username"), username))
    .first();

  // Bad cookies if the username isn't valid
  if (!existingUser) {
    throw new ConvexError(
      "Error authenticating client, please try logging in again."
    );
  }

  // Check the session ID against the user's ID
  if (compareSync(existingUser._id, sessionId)) {
    return true;
  } else {
    return false;
  }
}
