"use server";

import { ConvexError, v } from "convex/values";

import { query } from "../_generated/server";
import { validateUser } from "../authHelpers";
import { validateSession } from "../mutations/userAuthentication";

export const listGames = query({
  args: {
    sessionId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("listing games", args);
    // An invalid user should not have access to the games
    if (!validateUser(ctx, args.sessionId, args.username)) {
      throw new ConvexError(
        "Error authenticating client, please try logging in again."
      );
    }

    // Find the user
    const user = await ctx.db
      .query("user")
      .withIndex("by_username")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();

    // Return their games if they exst, otherwise error
    if (!user) {
      throw new ConvexError(
        "Error authenticating client, please try logging in again."
      );
    }

    // Query the game documents based on the user's game IDs
    console.log("for", user);
    return Promise.all((user.games ?? []).map((gameId) => ctx.db.get(gameId)));
  },
});
