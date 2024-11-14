"use server";

import { compareSync } from "bcrypt-ts";
import { ConvexError } from "convex/values";

import { Doc, Id } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";

/**
 * Validates the given username based on predefined criteria.
 *
 * @param username - The username to validate.
 * @returns A promise that resolves to a boolean indicating whether the username is valid.
 *
 * @remarks
 * The current validation criteria checks if the username length is at least 6 characters.
 */
export async function validateUsername(username: string) {
  var valid = true;
  // Ensure username length
  if (username.length < 6) {
    valid = false;
  }
  return valid;
}

/**
 * Fetches a user from the database by their username.
 *
 * @param ctx - The query context containing the database connection.
 * @param username - The username of the user to fetch.
 * @returns A promise that resolves to the user object if found, otherwise null.
 *
 * @throws {ConvexError} If the username is invalid.
 */
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

/**
 * Validates a user session by checking the provided session ID and username.
 *
 * @param ctx - The query context used to fetch the user.
 * @param sessionId - The session ID to validate.
 * @param username - The username associated with the session.
 * @returns The existing user if the session is valid, otherwise null.
 *
 * @throws {ConvexError} If the username is not valid.
 */
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

/**
 * Validates a player's action within a game session.
 *
 * @param ctx - The query context containing the database and other utilities.
 * @param sessionId - The session ID of the user.
 * @param username - The username of the player.
 * @param gameId - The ID of the game.
 * @param playerId - The ID of the player.
 * @returns A promise that resolves to an array containing the game document and the player document.
 *
 * @throws {ConvexError} If the user cannot be authenticated, the game or player cannot be found,
 *                       the player is not part of the game, it is not the player's turn,
 *                       or the player's username does not match the provided username.
 */
export async function validatePlayerAction(
  ctx: QueryCtx,
  sessionId: string,
  username: string,
  gameId: Id<"game">,
  playerId: Id<"player">
) {
  // Validate the user
  const user = await validateSession(ctx, sessionId, username);
  if (!user) {
    throw new ConvexError(
      "Error authenticating client, please try logging in again."
    );
  }

  // The game has to exist, and the player has to be in the game
  const game = await ctx.db.get(gameId);
  if (
    !game ||
    !game.players.some(
      (player) => player.playerId === playerId && player.username === username
    )
  ) {
    throw new ConvexError(
      "An error occurred fetching the requested player. Please try again."
    );
  }

  // The game's active player has to be the player acting
  if (game.activePlayer !== playerId) {
    throw new ConvexError("Error acting, it is not your turn.");
  }

  // Fetch the player
  const player = await ctx.db.get(playerId);
  if (!player) {
    throw new ConvexError("Error fetching requested player, please try again.");
  }

  // Make sure this player is the user's player (kinda superfluous, but easy computationally)
  if (player.username !== username) {
    throw new ConvexError("Error fetching requested player, please try again.");
  }

  return [game as Doc<"game">, player as Doc<"player">];
}
