import { ConvexError } from "convex/values";
import { move } from "react-big-calendar";

import { BOARD } from "../../app/constants";
import { Doc } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { randomInt } from "../generalHelpers";

export const algorithms = ["random"];

// Things to do in a turn
// 1. Choose a movement location
// 2. Suggest / Accuse
export function takeAlgorithmTurn(ctx: MutationCtx, player: Doc<"player">) {
  // If the player is eliminated, they can't take a turn
  if (player.eliminated) {
    return;
  }

  // The algorithm must exist
  if (!algorithms.includes(player.algorithm)) {
    throw new ConvexError("Invalid algorithm for player.");
  }

  if (player.algorithm === "random") {
    randomAlgorithm(ctx, player);
    return;
  }
}

function randomAlgorithm(ctx: MutationCtx, player: Doc<"player">) {
  // Roll the dice
  const moveRoll = randomInt(1, 6) + randomInt(1, 6);

  // Move the player
  const [[row, col], movesLeft] = targetClosestRoom(player, moveRoll);

  // Update the player's position
  ctx.db.patch(player._id, {
    row: row,
    col: col,
    moveRoll: moveRoll,
    movesLeft: movesLeft,
  });

  // 5% chance to accuse, 95% chance to suggest
  if (randomInt(1, 100) <= 5) {
    // Accuse
  } else {
    // Suggest
  }
}

function targetClosestRoom(
  player: Doc<"player">,
  moveRoll: number
): [[number, number], number] {
  // Find the closest room
  const initialPosition: [number, number] = [player.row, player.col];

  // Queue for BFS: stores [[row, col], remaining moves]
  let frontier: [[number, number], number][] = [
    [[initialPosition[0], initialPosition[1]], moveRoll],
  ];
  let visited = new Set<string>();
  visited.add(initialPosition.toString()); // Serialize coordinates as a string

  while (frontier.length > 0) {
    // Dequeue the next tile to process
    const current = frontier.shift(); // Safe extraction from the frontier
    if (!current) continue; // Defensive coding
    const [[row, col], remainingMoves] = current;

    // Check if we're in a room
    if (![" ", "x", "door"].includes(BOARD[row][col])) {
      return [[row, col], remainingMoves];
    }

    // If no moves are left, skip further exploration
    if (remainingMoves <= 0) {
      continue;
    }

    // Add adjacent tiles to the frontier
    for (const [r, c] of [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ]) {
      if (r < 0 || r >= BOARD.length || c < 0 || c >= BOARD[0].length) {
        continue; // Skip out-of-bounds tiles
      }

      const coordKey = `${r},${c}`; // Serialize coordinates as a string
      if (visited.has(coordKey)) {
        continue; // Skip already visited tiles
      }

      visited.add(coordKey); // Mark this tile as visited
      frontier.push([[r, c], remainingMoves - 1]); // Add to the frontier with reduced moves
    }
    // If this was the last tile in the frontier, we couldn't find a room
    if (frontier.length === 0) {
      return [[row, col], remainingMoves];
    }
  }

  // If no room was found, return the initial position
  return [initialPosition, moveRoll];
}
