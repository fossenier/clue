"use client";

import React from "react";

import { Id } from "@/convex/_generated/dataModel";
import { Stack } from "@mui/material";

import Cards from "./Cards";
import Roll from "./Roll";
import Suggest from "./Suggest";

interface PanelProps {
  // playerId: Id<"player">; // The player's id for appling actions
  // activePlayerUsername: string; // The display name of the active player
  // isActivePlayerEliminated: boolean; // Whether the active player is eliminated
  // isPlayerTurn: boolean; // Whether the user is the active player
  cardSidebar: string[]; // The game's sidebar cards
  cardHand: string[]; // The user's hand of cards
  // moveRoll: number; // The number of moves the user rolled
  // movesLeft: number; // The number of moves the user has left
  // playerPositions: { [username: string]: { row: number; col: number } }; // Where the player's are located
}

const Panel: React.FC<PanelProps> = ({
  // playerId,
  // activePlayerUsername,
  // isActivePlayerEliminated,
  // isPlayerTurn,
  cardSidebar,
  cardHand,
  // moveRoll,
  // movesLeft,
  // playerPositions,
}) => {
  return (
    <div className="h-full w-full bg-white">
      <Stack spacing={2} direction={"column"}>
        <Cards cardSourceName="My Cards" sourceCards={cardHand}></Cards>
        <Cards cardSourceName="Sidebar" sourceCards={cardSidebar}></Cards>
        <Roll></Roll>
        <Suggest></Suggest>
      </Stack>
    </div>
  );
};

export default Panel;
