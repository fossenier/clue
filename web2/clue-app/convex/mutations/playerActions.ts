"use server";

import { ConvexError, v } from "convex/values";

import { Doc } from "../_generated/dataModel";
import { mutation, MutationCtx } from "../_generated/server";
import { validatePlayerAction, validateSession } from "../authHelpers";
import { validateTargetLocation } from "../boardHelpers";
import { randomInt } from "../generalHelpers";

/**
 * Creates a new player in the game with the specified attributes.
 *
 * @param ctx - The mutation context containing the database connection.
 * @param username - The username of the player.
 * @param algorithm - The algorithm associated with the player.
 * @param cards - An array of cards assigned to the player.
 * @param suspect - The suspect character associated with the player.
 * @param row - The starting row position of the player on the game board.
 * @param col - The starting column position of the player on the game board.
 * @returns A promise that resolves to the ID of the newly created player.
 */
export async function createPlayer(
  ctx: MutationCtx,
  username: string,
  algorithm: string,
  cards: string[],
  suspect: string,
  row: number,
  col: number
) {
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
/**
 * Mutation to roll dice for a player in a game session.
 *
 * @param args - The arguments for the mutation.
 * @param args.sessionId - The session ID of the user.
 * @param args.username - The username of the user.
 * @param args.gameId - The ID of the game.
 * @param args.playerId - The ID of the player.
 * @returns The result of the dice roll (sum of two 6-sided dice).
 *
 * @throws {ConvexError} If the user authentication fails.
 */
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

    // Validate the ability for this player to act
    const results = await validatePlayerAction(
      ctx,
      args.sessionId,
      args.username,
      args.gameId,
      args.playerId
    );

    const player = results[1] as Doc<"player">;

    if (player.moveRoll) {
      throw new ConvexError("Error rolling dice, player has already rolled.");
    }

    // Roll the dice (2d6)
    const moveRoll = randomInt(1, 6) + randomInt(1, 6);
    await ctx.db.patch(args.playerId, { moveRoll, movesLeft: moveRoll });

    return moveRoll;
  },
});

/**
 * Mutation to move a player to a new location on the game board.
 *
 * @param args - The arguments for the mutation.
 * @param args.sessionId - The session ID of the user.
 * @param args.username - The username of the player.
 * @param args.gameId - The ID of the game.
 * @param args.playerId - The ID of the player.
 * @param args.row - The target row to move the player to.
 * @param args.col - The target column to move the player to.
 * @returns A promise that resolves to `true` if the player was successfully moved.
 * @throws {ConvexError} If the user cannot be authenticated, the player has no moves left, or the target location is not reachable.
 */
export const movePlayer = mutation({
  args: {
    sessionId: v.string(),
    username: v.string(),
    gameId: v.id("game"),
    playerId: v.id("player"),
    row: v.number(),
    col: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate the user
    const user = await validateSession(ctx, args.sessionId, args.username);
    if (!user) {
      throw new ConvexError(
        "Error authenticating client, please try logging in again."
      );
    }

    const result = await validatePlayerAction(
      ctx,
      args.sessionId,
      args.username,
      args.gameId,
      args.playerId
    );
    const game = result[0] as Doc<"game">;
    const player = result[1] as Doc<"player">;

    // Make sure the player has moves left
    if (!player.movesLeft) {
      throw new ConvexError("Error moving player, no moves left.");
    }

    // Make sure the player's move is valid
    const movesUsed = validateTargetLocation(
      { row: player.row, col: player.col },
      { row: args.row, col: args.col },
      player.movesLeft
    );

    if (movesUsed === -1) {
      throw new ConvexError(
        "Error moving player, target location is not reachable."
      );
    }

    // Update the player's location
    await ctx.db.patch(args.playerId, {
      row: args.row,
      col: args.col,
      movesLeft: player.movesLeft - movesUsed,
    });

    return true;
  },
});
