"use server";

import { ConvexError, v } from "convex/values";

import { mutation, MutationCtx } from "../_generated/server";
import { validateSession } from "../authHelpers";
import { randomInt } from "../generalHelpers";

export async function createPlayer(
  ctx: MutationCtx,
  username: string,
  algorithm: string,
  cards: string[],
  suspect: string,
  row: number,
  col: number
) {
  console.log("createPlayer");
  const playerId = await ctx.db.insert("player", {
    username,
    algorithm,
    cards,
    suspect,
    row,
    col,
    moveRoll: 0,
    movesLeft: 0,
    eliminated: false,
    victorious: false,
  });

  return playerId;
}

// Rolls the dice on a player's turn for them to move
export const rollDice = mutation({
  args: {
    sessionId: v.string(),
    username: v.string(),
    gameId: v.id("game"),
    playerId: v.id("player"),
  },
  handler: async (ctx, args) => {
    // Validate the user
    const user = await validateSession(ctx, args.sessionId, args.username);
    if (!user) {
      throw new ConvexError(
        "Error authenticating client, please try logging in again."
      );
    }

    // The game has to exist, and the player has to be in the game
    const game = await ctx.db.get(args.gameId);
    if (
      !game ||
      !game.players.some(
        (player) =>
          player.playerId === args.playerId && player.username === args.username
      )
    ) {
      throw new ConvexError(
        "An error occurred fetching the requested player. Please try again."
      );
    }

    // The game's active player has to be the player rolling the dice
    if (game.activePlayer !== args.playerId) {
      throw new ConvexError("Error rolling dice, it is not your turn.");
    }

    // Fetch the player
    const player = await ctx.db.get(args.playerId);
    if (!player) {
      throw new ConvexError(
        "B Error fetching requested player, please try again."
      );
    }

    // Make sure this player is the user's player (kinda superfluous, but easy computationally)
    if (player.username !== args.username) {
      throw new ConvexError(
        "C Error fetching requested player, please try again."
      );
    }

    // Roll the dice (2d6)
    const moveRoll = randomInt(1, 6) + randomInt(1, 6);
    await ctx.db.patch(args.playerId, { moveRoll, movesLeft: moveRoll });

    return moveRoll;
  },
});
