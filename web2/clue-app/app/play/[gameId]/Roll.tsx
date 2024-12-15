"use client";

import { useMutation } from "convex/react";
import React, { useEffect, useState } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@mui/material";

interface RollProps {
  sessionId: string;
  username: string;
  gameId: Id<"game">;
  playerId: Id<"player">;
  isPlayerTurn: boolean;
  moveRoll: number | null;
  movesLeft: number | null;
}

const Roll: React.FC<RollProps> = ({
  sessionId,
  username,
  gameId,
  playerId,
  isPlayerTurn,
  moveRoll,
  movesLeft,
}) => {
  // Store the user's rolls this turn, and how much movement they have left
  const [rollResult, setRollResult] = useState<number | null>(moveRoll);
  const [movesLeftDisplay, setMovesLeftDisplay] = useState<number | null>(
    movesLeft
  );

  // Update movesLeftDisplay when the movesLeft prop changes
  useEffect(() => {
    setMovesLeftDisplay(movesLeft);
  }, [movesLeft]);

  // Convex mutation to roll the dice
  const rollDice = useMutation(api.mutations.playerActions.rollDice);

  // Roll the user's dice for the turn
  const handleRollDice = async () => {
    if (sessionId && username && gameId && playerId) {
      const dice = await rollDice({
        sessionId: sessionId,
        username: username,
        gameId: gameId,
        playerId: playerId,
      });

      setRollResult(dice);
      setMovesLeftDisplay(dice);
    }
  };

  return (
    <div className="w-full h-full p-2 flex flex-col items-center">
      <div className="w-5/6 bg-indigo-300 rounded-md p-2 flex justify-center">
        <p>Movement</p>
      </div>
      <div className="p-2 flex flex-col flex-wrap gap-2 justify-center">
        <Button
          variant="contained"
          onClick={handleRollDice}
          disabled={![0, null].includes(rollResult) || !isPlayerTurn}
        >
          Roll
        </Button>
        <p className="text-black">
          Roll: {[0, null].includes(rollResult) ? "?" : rollResult}
        </p>
        <p className="text-black">
          Moves left: {movesLeftDisplay !== null ? movesLeftDisplay : "?"}
        </p>
      </div>
    </div>
  );
};

export default Roll;
