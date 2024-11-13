"use server";

import { ConvexError, v } from "convex/values";

import { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { validateSession } from "../authHelpers";

export const listPlayers = query({
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
    const game = await ctx.db.get(args.gameId);
    // If the game is not found, throw an error
    if (!game) {
      throw new ConvexError("Error fetching requested game, please try again.");
    }

    // Fetch the player documents
    const players = await Promise.all(
      (game.players ?? []).map(({ playerId }) => ctx.db.get(playerId))
    );

    // Filter out null values
    return players.filter((player): player is Doc<"player"> => player !== null);
  },
});
