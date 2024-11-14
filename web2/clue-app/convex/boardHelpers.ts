import { BOARD } from "../app/constants";

/**
 * Retrieves the tile at the specified position on the board.
 *
 * @param pos - An object containing the row and column indices of the tile.
 * @returns The tile at the specified position, or "x" if the position is out of bounds.
 */
function getTile(pos: { row: number; col: number }) {
  try {
    return BOARD[pos.row][pos.col];
  } catch {
    return "x";
  }
}

/**
 * Validates if a target location is reachable from a given position within a specified number of moves.
 *
 * @param pos - The current position with row and column coordinates.
 * @param target - The target position with row and column coordinates.
 * @param movesLeft - The number of moves left to reach the target.
 * @returns The number of moves used in reaching the target, and -1 if the target is not reachable.
 */
export function validateTargetLocation(
  pos: { row: number; col: number },
  target: { row: number; col: number },
  movesLeft: number
): number {
  // See where the user is standing and where they want to go
  const posTile = getTile(pos);
  const targetTile = getTile(target);

  // Make sure the pos and target tiles are valid
  if ([posTile, targetTile].includes("x")) {
    return -1;
  }

  // Check passages
  if (
    ([posTile, targetTile].includes("conservatory") &&
      [posTile, targetTile].includes("lounge")) ||
    ([posTile, targetTile].includes("study") &&
      [posTile, targetTile].includes("kitchen"))
  ) {
    return movesLeft;
  }

  // Do manual pathfinding
  const visited = new Set(); // Track visited tiles
  const queue = [{ pos: pos, availableMoves: movesLeft }]; // The frontier
  while (queue.length) {
    // Get the next tile to explore
    const { pos, availableMoves } = queue.shift() ?? {
      pos: { row: -1, col: -1 },
      availableMoves: -1,
    };
    // Stop if we've reached the target
    if (pos.row === target.row && pos.col === target.col) {
      if (![" ", "door"].includes(targetTile)) {
        // Entering a room uses all remaining moves
        return movesLeft;
      } else {
        // Stepping anywhere else may have some moves left
        return movesLeft - availableMoves;
      }
    }
    // Skip visited tiles
    if (visited.has(`${pos.row},${pos.col}`)) {
      continue;
    }
    // Mark the tile as visited
    visited.add(`${pos.row},${pos.col}`);
    // Add adjacent valid tiles to the queue
    if (availableMoves > 0) {
      for (const dir of ["up", "down", "left", "right"]) {
        const newPos = { ...pos };
        switch (dir) {
          case "up":
            newPos.row--;
            break;
          case "down":
            newPos.row++;
            break;
          case "left":
            newPos.col--;
            break;
          case "right":
            newPos.col++;
            break;
        }
        if (getTile(newPos) !== "x") {
          queue.push({ pos: newPos, availableMoves: availableMoves - 1 });
        }
      }
    }
  }

  return -1;
}
