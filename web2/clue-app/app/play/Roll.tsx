import React, { useState } from "react";
import { move } from "react-big-calendar";

import { SUSPECTS } from "@constants/index";
import { Button } from "@mui/material";

const Roll: React.FC = () => {
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [movesLeft, setMovesLeft] = useState<number | null>(null);

  const rollDice = () => {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    setRollResult(total);
    setMovesLeft(total);
  };

  return (
    <div className="w-full h-full p-2 flex flex-col items-center">
      <div className="w-5/6 bg-indigo-300 rounded-md p-2 flex justify-center">
        <p>Movement</p>
      </div>
      <div className="p-2 flex flex-col flex-wrap gap-2 justify-center">
        <Button
          variant="contained"
          onClick={rollDice}
          disabled={rollResult != null}
        >
          Roll
        </Button>
        <p className="text-black">Roll: {rollResult ? rollResult : "?"}</p>
        <p className="text-black">Moves left: {movesLeft ? movesLeft : "?"}</p>
      </div>
    </div>
  );
};

export default Roll;
