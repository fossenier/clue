"use server";

import { ConvexError, v } from "convex/values";

import { Doc, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { validateSession } from "../authHelpers";

export const listGames = query({
  args: {
    sessionId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // An invalid user should not have access to the games
    const user = await validateSession(ctx, args.sessionId, args.username);
    if (!user) {
      throw new ConvexError(
        "Error authenticating client, please try logging in again."
      );
    }

    // Query the game documents based on the user's game IDs
    const games = await Promise.all(
      (user.games ?? []).map((gameId) => ctx.db.get(gameId))
    );

    // Filter out null values
    return games.filter((game): game is Doc<"game"> => game !== null);
  },
});

export const getGame = query({
  args: {
    sessionId: v.string(),
    username: v.string(),
    gameId: v.id("game"),
  },
  handler: async (ctx, args) => {
    // An invalid user should not have access to the games
    const user = await validateSession(ctx, args.sessionId, args.username);
    if (!user) {
      throw new ConvexError(
        "Error authenticating client, please try logging in again."
      );
    }

    // If the game is not in the user's games, they should not have access
    if (!user.games.includes(args.gameId)) {
      throw new ConvexError("Error fetching requested game, please try again.");
    }

    // Fetch the game document
    return ctx.db.get(args.gameId);
  },
});
