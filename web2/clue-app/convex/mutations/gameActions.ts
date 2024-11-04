"use server";

import { ConvexError, v } from 'convex/values';

import { COORDS, ROOMS, SUSPECTS, WEAPONS } from '../../app/constants/index';
import { Id } from '../_generated/dataModel';
import { mutation, MutationCtx } from '../_generated/server';
import { existingUsername, validateUser } from '../authHelpers';
import { algorithms } from '../clue/gameLogic';
import { createPlayer } from './playerActions';

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
};

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

// Make sure each passed player conforms to the ValidatedPlayer type
async function validatePlayers(
  ctx: MutationCtx,
  players: PlayerInput[]
): Promise<ValidatedPlayer[]> {
  const player: ValidatedPlayer[] = [];

  await Promise.all(
    players.map(async (player) => {
      if (player.username && player.suspect in COORDS) {
        // The username is provided, the client intends this to be a human
        if (await existingUsername(ctx, player.username)) {
          // The username is valid and in the system
          players.push({
            ...player,
            suspect: player.suspect as SuspectKey,
          });
        }
      } else if (player.algorithm && algorithms.includes(player.algorithm)) {
        // The algorithm is provided, the client intends this to be a bot
        players.push({
          ...player,
          suspect: player.suspect as SuspectKey,
        });
      }
    })
  );

  return player;
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
    if (!validateUser) {
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

    const validatedPlayerIds: Id<"player">[] = await Promise.all(
      players.map((validatedPlayer) => {
        const hand = Array.from({ length: handSize }, () => {
          const randomIndex = randomInt(remainingCards.length);
          return remainingCards.splice(randomIndex, 1)[0];
        });

        const [x, y] = COORDS[validatedPlayer.suspect];
        return createPlayer(
          ctx,
          validatedPlayer.username,
          validatedPlayer.algorithm,
          hand,
          validatedPlayer.suspect,
          x,
          y
        );
      })
    );

    // Insert the game into the database
    const gameId = await ctx.db.insert("game", {
      murderer: murdererCards,
      cardSidebar: remainingCards,
      players: validatedPlayerIds,
      activePlayer: validatedPlayerIds[0],
      suggestions: [],
    });

    return gameId;
  },
});
