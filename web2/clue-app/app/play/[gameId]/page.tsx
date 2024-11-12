"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "typescript-cookie";

import { useGameContext } from "@/app/gameContext";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import Board from "./Board";
import Panel from "./Panel";

export default function ClueView() {
  // Context management (this will hold the game data if the user comes
  // from /games)
  const params = useParams();
  const gameId = params.gameId;
  const gameContext = useGameContext();

  // Session Id and username from cookies
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);

  // The user's game to interact with (from context or Convex)
  const [game, setGame] = useState<Doc<"game"> | undefined>(undefined);

  // Convex query to get the game from the database
  // On startup only runs when context is not present
  const gameQueryResult = useQuery(
    api.queries.gameLoading.getGame,
    sessionId && username && gameId && !gameContext.gameData
      ? {
          sessionId: sessionId,
          username: username,
          gameId: gameId as Id<"game">,
        }
      : "skip"
  );

  // Sets the sessionId and username from cookies when the page loads
  useEffect(() => {
    const sessionId = getCookie("session-id");
    const username = getCookie("username");
    setSessionId(sessionId);
    setUsername(username);
  }, []);

  // Sets the game from context or Convex when the page loads
  useEffect(() => {
    if (gameContext.gameData) {
      setGame(gameContext.gameData);
    } else if (gameQueryResult) {
      setGame(gameQueryResult);
    }
  }, [gameQueryResult, gameContext.gameData]);

  // The idx is given by Board
  const handleBoardTileSelect = (idx: number) => {
    console.log(`Selected row ${Math.floor(idx / 25)} and column ${idx % 25}`);
  };

  const formatPanelData = () => {
    return {
      cardSidebar: game?.cardSidebar ?? ["Loading..."],
      cardHand: game?.cardSidebar ?? ["Loading..."],
    };
  };

  return (
    <div>
      <div className="flex h-dvh w-dvw">
        <div className="w-1/6">
          <Panel {...formatPanelData()} />
        </div>
        <div className="w-5/6">
          <Board onTileSelect={handleBoardTileSelect} />
        </div>
      </div>
    </div>
  );
}
