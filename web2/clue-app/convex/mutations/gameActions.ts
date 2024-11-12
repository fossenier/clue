"use server";

import { ConvexError, v } from "convex/values";

import { COORDS, ROOMS, SUSPECTS, WEAPONS } from "../../app/constants/index";
import { Doc, Id } from "../_generated/dataModel";
import { mutation, MutationCtx } from "../_generated/server";
import { fetchUser, validateSession } from "../authHelpers";
import { algorithms } from "../clue/gameLogic";
import { createPlayer } from "./playerActions";

// This is what the client will be passing
type PlayerInput = {
  username: string;
  algorithm: string;
  suspect: string;
};

// This is what we want to make sure each passed player conforms to
type SuspectKey = keyof typeof COORDS;
type ValidatedPlayer = {
  username: string;
  algorithm: string;
  suspect: SuspectKey;
  user?: Doc<"user">;
};

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

// Make sure each passed player conforms to the ValidatedPlayer type
async function validatePlayers(
  ctx: MutationCtx,
  players: PlayerInput[]
): Promise<ValidatedPlayer[]> {
  const validatedPlayers: ValidatedPlayer[] = [];

  await Promise.all(
    players.map(async (player) => {
      if (player.username && player.suspect in COORDS) {
        console.log("This is a valid suspect human player");
        // The username is provided, the client intends this to be a human
        const user = await fetchUser(ctx, player.username);
        if (user) {
          // The username is valid and in the system
          validatedPlayers.push({
            ...player,
            suspect: player.suspect as SuspectKey,
            user: user,
          });
        }
      } else if (
        player.algorithm &&
        algorithms.includes(player.algorithm) &&
        player.suspect in COORDS
      ) {
        console.log("This is a valid algorithm player");
        // The algorithm is provided, the client intends this to be a bot
        validatedPlayers.push({
          ...player,
          suspect: player.suspect as SuspectKey,
        });
      }
    })
  );

  return validatedPlayers;
}

// Helper function to draw murderer and remaining cards
function drawMurdererCards() {
  const murdererCards = [
    SUSPECTS[randomInt(SUSPECTS.length)],
    WEAPONS[randomInt(WEAPONS.length)],
    ROOMS[randomInt(ROOMS.length)],
  ];
  const remainingCards = [...SUSPECTS, ...WEAPONS, ...ROOMS].filter(
    (card) => !murdererCards.includes(card)
  );

  return { murdererCards, remainingCards };
}

// Main mutation function to create a game
export const createGame = mutation({
  args: {
    sessionId: v.string(),
    username: v.string(),
    players: v.array(
      v.object({
        username: v.string(),
        algorithm: v.string(),
        suspect: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (!validateSession(ctx, args.sessionId, args.username)) {
      throw new ConvexError(
        "Error authenticating client, please try logging in again."
      );
    }

    const players = await validatePlayers(ctx, args.players);

    if (players.length < 3) {
      throw new ConvexError(
        "Error creating game, not enough players to start."
      );
    }

    const { murdererCards, remainingCards } = drawMurdererCards();
    const handSize = Math.floor(remainingCards.length / players.length);

    const validatedPlayerEntries = await Promise.all(
      players.map(async (validatedPlayer) => {
        const hand = Array.from({ length: handSize }, () => {
          const randomIndex = randomInt(remainingCards.length);
          return remainingCards.splice(randomIndex, 1)[0];
        });

        const [x, y] = COORDS[validatedPlayer.suspect];
        const playerId = await createPlayer(
          ctx,
          validatedPlayer.username,
          validatedPlayer.algorithm,
          hand,
          validatedPlayer.suspect,
          x,
          y
        );

        return { username: validatedPlayer.username, playerId };
      })
    );

    // Insert the game into the database
    const gameId = await ctx.db.insert("game", {
      murderer: murdererCards,
      cardSidebar: remainingCards,
      players: validatedPlayerEntries,
      activePlayer: validatedPlayerEntries[0].playerId,
      suggestions: [],
    });

    players.forEach(async (validatedPlayer) => {
      if (validatedPlayer.user) {
        const games = validatedPlayer.user.games;
        games.push(gameId);
        await ctx.db.patch(validatedPlayer.user._id, { games: games });
      }
    });

    return gameId;
  },
});

export const removeGame = mutation({
  args: {
    sessionId: v.string(),
    username: v.string(),
    gameId: v.id("game"),
  },
  handler: async (ctx, args) => {
    // Make sure the user calling this function is real and authenticated
    const user = await validateSession(ctx, args.sessionId, args.username);
    if (!user) {
      throw new ConvexError(
        "Error authenticating client, please try logging in again."
      );
    }

    // Make sure the user is trying to delete is one of their games
    if (!user.games.includes(args.gameId)) {
      throw new ConvexError("Error fetching requested game, please try again.");
    }

    // Fetch the game that the user is attempting to delete
    const game = await ctx.db.get(args.gameId);

    if (!game) {
      throw new ConvexError("Error fetching requested game, please try again.");
    }

    // Iterate through the players in the game
    await Promise.all(
      // Fetch them by Id from the system
      game.players.map(async ({ playerId }) => {
        const player = await ctx.db.get(playerId);
        if (!player) return;

        const playerUser = await fetchUser(ctx, player.username);
        if (playerUser) {
          // Remove the game from the user's games
          const updatedGames = playerUser.games.filter(
            (gameId) => gameId !== args.gameId
          );
          await ctx.db.patch(playerUser._id, { games: updatedGames });
        }
        // Delete the player from the database (they exist only for games)
        await ctx.db.delete(playerId);
      })
    );

    // Iterate through the suggestions in the game
    await Promise.all(
      // Fetch the suggestion by Id from the system
      game.suggestions.map(async (suggestionId) => {
        const suggestion = await ctx.db.get(suggestionId);
        if (!suggestion) return;

        // Iterate through the responses to each suggestion
        await Promise.all(
          suggestion.responses.map(async (responseId) => {
            // Delete the response from the database
            await ctx.db.delete(responseId);
          })
        );
        // Delete the suggestion from the database
        await ctx.db.delete(suggestionId);
      })
    );

    // Delete the game from the database
    await ctx.db.delete(args.gameId);
    return true;
  },
});
