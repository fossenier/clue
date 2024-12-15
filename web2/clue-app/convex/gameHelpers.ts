import { Doc } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

/**
 * Advances the active player to the next player in the game.
 *
 * @param ctx - The mutation context containing the database operations.
 * @param game - The game document containing the current game state.
 */
export function nextPlayer(ctx: MutationCtx, game: Doc<"game">): void {
  // Find the current active player index
  const activePlayerIndex = game.players.findIndex(
    (player) => player.playerId === game.activePlayer
  );
  // Step to the next player
  const nextPlayerIndex = (activePlayerIndex + 1) % game.players.length;
  // Set the next player
  ctx.db.patch(game._id, {
    activePlayer: game.players[nextPlayerIndex].playerId,
  });
}
