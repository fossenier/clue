"use client";

import { useParams } from 'next/navigation';

import { useGameContext } from '@/app/gameContext';
import { Doc } from '@/convex/_generated/dataModel';

export default function ClueView() {
  // Get the game ID from the URL
  const params = useParams();
  const gameId = params.gameId;

  // Check if the game context is available (from /games)
  const gameContext = useGameContext();
  if (!gameContext.gameData) {
    // Fetchy
  }

  // Get the game data if it's not available
  console.log(gameContext.gameData);
  if (!gameContext.gameData) {
    // Fetch game details from Convex
    console.log("Fetching game details...");
  }

  // Replace with real data fetching logic
  const gameDetails = {
    name: "Example Game",
    description: "An exciting game.",
  };

  return (
    <div>
      <h1>
        Game: {gameDetails.name} (ID: {gameId})
      </h1>
      <p>{gameDetails.description}</p>
    </div>
  );
}
