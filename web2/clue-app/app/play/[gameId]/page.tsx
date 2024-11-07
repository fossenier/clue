"use client";

import { useMutation, useQueries, useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { getCookie } from 'typescript-cookie';

import { useGameContext } from '@/app/gameContext';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';

export default function ClueView() {
  // Context management
  const params = useParams();
  const gameId = params.gameId;
  const gameContext = useGameContext();

  // Session Id and username from cookies
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);

  // The user's game (from context or Convex)
  const [game, setGame] = useState<Doc<"game"> | undefined>(undefined);

  // Convex query to get the game
  const queryResult = useQuery(
    api.queries.gameLoading.getGame,
    sessionId && username && gameId
      ? {
          sessionId: sessionId,
          username: username,
          gameId: gameId as Id<"game">,
        }
      : "skip"
  );

  useEffect(() => {
    const session = getCookie("session-id");
    const username = getCookie("username");
    console.log("Setting session and username...");
    setSessionId(session);
    setUsername(username);
  }, []);

  useEffect(() => {
    if (gameContext.gameData) {
      console.log("Using game data from context...");
      setGame(gameContext.gameData);
    } else if (queryResult) {
      console.log("Using game data from Convex...");
      setGame(queryResult);
    }
  }, [queryResult, gameContext.gameData]);

  return (
    <div>
      <h1>{game ? `Game Details -> ${game.murderer}` : "Loading..."}</h1>
    </div>
  );
}
