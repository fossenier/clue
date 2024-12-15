"use client";

import { useMutation, useQuery } from "convex/react";
import { on } from "events";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "typescript-cookie";

import { BOARD } from "@/app/constants";
import { useGameContext } from "@/app/gameContext";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

import Board, { BoardProps, PlayerData } from "./Board";
import Panel from "./Panel";

export default function ClueView() {
  // Context management (this will hold the game data if the user comes
  // from /games)
  const params = useParams();
  const gameId = params.gameId as Id<"game">;
  const gameContext = useGameContext();

  // Session Id and username from cookies
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);

  // The user's game to interact with (from context or Convex)
  const [game, setGame] = useState<Doc<"game"> | undefined>(undefined);
  const [userPlayer, setUserPlayer] = useState<Doc<"player"> | undefined>(
    undefined
  );
  const [otherPlayers, setOtherPlayers] = useState<Doc<"player">[] | undefined>(
    undefined
  );

  // Convex query to get the game from the database
  // On startup only runs when context is not present
  const gameQueryResult = useQuery(
    api.queries.gameLoading.getGame,
    sessionId && username && gameId && !gameContext.gameData
      ? {
          sessionId: sessionId,
          username: username,
          gameId: gameId,
        }
      : "skip"
  );

  // Convex query to get the player data from the database
  // Will update as the game progresses
  const playerQueryResult = useQuery(
    api.queries.playerLoading.listPlayers,
    sessionId && username && gameId && game
      ? {
          sessionId: sessionId,
          username: username,
          gameId: gameId,
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

  // Gets the game's player data
  useEffect(() => {
    if (playerQueryResult) {
      setUserPlayer(
        playerQueryResult.find((player) => player.username === username)
      );
      setOtherPlayers(
        playerQueryResult.filter((player) => player.username !== username)
      );
    }
  }, [playerQueryResult, username]);

  // Setup the "move player" functionality
  const movePlayer = useMutation(api.mutations.playerActions.movePlayer);

  // The idx is given by Board
  const handleBoardTileSelect = async (row: number, col: number) => {
    // The user is trying to move here, assess if they are currently able to move
    if (game?.activePlayer !== userPlayer?._id) {
      console.log("Not your turn");
      return;
    }
    if (userPlayer?.movesLeft === 0) {
      console.log("No moves left");
      return;
    }

    // Make sure it's not a wall
    if (BOARD[row][col] === "x") {
      console.log("Can't move to a wall");
      return;
    }

    const result = await movePlayer({
      sessionId: sessionId ?? "",
      username: username ?? "",
      gameId: gameId,
      playerId: userPlayer?._id ?? ("" as Id<"player">),
      row: row,
      col: col,
    });

    if (result) {
      console.log("Moved player");
    } else {
      console.log("Failed to move player");
    }
  };

  const formatPanelData = () => {
    return {
      sessionId: sessionId ?? "",
      username: username ?? "",
      gameId: gameId ?? ("" as Id<"game">),
      playerId: userPlayer?._id ?? ("" as Id<"player">),
      isPlayerTurn: game?.activePlayer === userPlayer?._id,
      playerRoom:
        userPlayer?.row !== undefined && userPlayer?.col !== undefined
          ? BOARD[userPlayer.row][userPlayer.col]
          : null,
      cardSidebar: game?.cardSidebar ?? ["Loading..."],
      cardHand: userPlayer?.cards ?? ["Loading..."],
      moveRoll:
        game?.activePlayer === userPlayer?._id
          ? userPlayer?.moveRoll ?? 0
          : null,
      movesLeft:
        game?.activePlayer === userPlayer?._id
          ? userPlayer?.movesLeft ?? 0
          : null,
    };
  };

  const formatBoardData = (): BoardProps => {
    if (!otherPlayers) {
      return {
        onTileSelect: handleBoardTileSelect,
        players: {},
      };
    }

    return {
      onTileSelect: handleBoardTileSelect,
      players: [...otherPlayers, ...(userPlayer ? [userPlayer] : [])].reduce(
        (acc: Record<string, PlayerData>, player) => {
          acc[player.suspect] = {
            username: player.username,
            row: player.row,
            col: player.col,
          };
          return acc;
        },
        {}
      ),
    };
  };

  return (
    <div>
      <div className="flex h-dvh w-dvw">
        <div className="w-1/6">
          <Panel {...formatPanelData()} />
        </div>
        <div className="w-5/6">
          <Board {...formatBoardData()} />
        </div>
      </div>
    </div>
  );
}
