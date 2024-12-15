"use client";

import React from "react";

import { Id } from "@/convex/_generated/dataModel";
import { Stack } from "@mui/material";

import Cards from "./Cards";
import Roll from "./Roll";
import Suggest from "./Suggest";

interface PanelProps {
  sessionId: string;
  username: string;
  gameId: Id<"game">;
  playerId: Id<"player">; // The player's id for appling actions
  // activePlayerUsername: string; // The display name of the active player
  // isActivePlayerEliminated: boolean; // Whether the active player is eliminated
  isPlayerTurn: boolean; // Whether the user is the active player
  playerRoom: string | null; // The room the player is in or null
  cardSidebar: string[]; // The game's sidebar cards
  cardHand: string[]; // The user's hand of cards
  moveRoll: number | null; // The number of moves the user rolled
  movesLeft: number | null; // The number of moves the user has left
  // playerPositions: { [username: string]: { row: number; col: number } }; // Where the player's are located
  accuse: (cards: string[]) => void; // The function to accuse
}

const Panel: React.FC<PanelProps> = ({
  sessionId,
  username,
  gameId,
  playerId,
  // activePlayerUsername,
  // isActivePlayerEliminated,
  isPlayerTurn,
  playerRoom,
  cardSidebar,
  cardHand,
  moveRoll,
  movesLeft,
  // playerPositions,
  accuse,
}) => {
  return (
    <div className="h-full w-full bg-white">
      <Stack spacing={2} direction={"column"}>
        {cardHand.length !== 0 ? (
          <Cards cardSourceName="My Cards" sourceCards={cardHand}></Cards>
        ) : null}
        {cardSidebar.length !== 0 ? (
          <Cards cardSourceName="Sidebar" sourceCards={cardSidebar}></Cards>
        ) : null}
        {isPlayerTurn ? (
          <Roll
            sessionId={sessionId}
            username={username}
            gameId={gameId}
            playerId={playerId}
            isPlayerTurn={isPlayerTurn}
            moveRoll={moveRoll}
            movesLeft={movesLeft}
          ></Roll>
        ) : null}
        {isPlayerTurn ? (
          <Suggest playerRoom={playerRoom} accuse={accuse}></Suggest>
        ) : null}
      </Stack>
    </div>
  );
};

export default Panel;
