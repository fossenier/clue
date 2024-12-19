import { ConvexError } from "convex/values";

import { Doc } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

/**
 * Advances the active player to the next player in the game.
 *
 * @param ctx - The mutation context containing the database operations.
 * @param game - The game document containing the current game state.
 */
export async function nextPlayer(
  ctx: MutationCtx,
  game: Doc<"game">
): Promise<void> {
  // Find the current active player index
  var activePlayerIndex = game.players.findIndex(
    (player) => player.playerId === game.activePlayer
  );
  // Ensure the next player is not eliminated, and make sure they're not a bot
  var nextPlayerIndex = (activePlayerIndex + 1) % game.players.length;
  var fullyAdvanced = false;

  while (!fullyAdvanced) {
    // Step to the next player
    nextPlayerIndex = (activePlayerIndex + 1) % game.players.length;
    activePlayerIndex += 1;

    // Grab the player to validate them
    const nextPlayer = await ctx.db.get(game.players[nextPlayerIndex].playerId);
    if (nextPlayer === null) {
      throw new ConvexError(
        "Yeah, that's not supposed to happen. gameHelpers.ts 01."
      );
    }

    // Skip eliminated players
    if (nextPlayer.eliminated) {
      continue;
    }

    // Take bot turns
    if (nextPlayer.username === "") {
      // Do bot stuff
      // For now, just skip the bot
      continue;
    }

    // If we get here, the next player is valid
    fullyAdvanced = true;
  }

  // Set the next player
  ctx.db.patch(game._id, {
    activePlayer: game.players[nextPlayerIndex].playerId,
  });
}
