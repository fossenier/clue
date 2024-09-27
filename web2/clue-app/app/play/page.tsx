"use client";
import React from 'react';

import { BOARD, ROOMS, SUSPECTS, WEAPONS } from '@constants/index';

export default function play() {
  const updateBoardData = (idx: number) => {
    console.log(idx);
  };

  return (
    <div>
      <div className="grid grid-rows-25 grid-cols-25 overflow-visible object-contain">
        {BOARD.flat().map((cell, idx) => (
          <div
            onClick={() => updateBoardData(idx)}
            key={idx}
            className={`aspect-square flex items-center justify-center border-2 border-gray-300 cursor-pointer text-sm font-bold text-white ${
              // Set the tile's colour based on the contents of the tile
              cell === "x"
                ? "bg-red-600"
                : cell === " " || cell === "door"
                  ? "bg-yellow-200"
                  : "bg-black"
            }`}
          >
            {/* Display the contents of the cell (ex. room name) when it isn't a room or hallway */}
            {cell !== "x" && cell !== " " ? cell : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
