"use client";
import React from 'react';

import { BOARD, ROOMS, SUSPECTS, WEAPONS } from '@constants/index';

export default function play() {
  const updateBoardData = (idx: number) => {
    console.log(idx);
  };

  return (
    <div className={`w-auto h-auto`}>
      <div
        className={`grid w-full h-full`}
        style={{
          gridTemplateRows: `repeat(25, 1fr)`,
          gridTemplateColumns: `repeat(25, 1fr)`,
        }}
      >
        {BOARD.flat().map((cell, idx) => (
          <div
            onClick={() => updateBoardData(idx)}
            key={idx}
            className={`square flex items-center justify-center border-2 border-gray-300 cursor-pointer text-sm font-bold text-white ${
              // Set the tile's colour based on the contents of the tile
              cell === "x"
                ? "bg-red-600"
                : cell === " " || cell === "door"
                  ? "bg-yellow-200"
                  : "bg-black"
            }`}
            style={{
              // Enforce a square aspect ratio
              aspectRatio: "1 / 1",
            }}
          >
            {/* Display the contents of the cell (ex. room name) when it isn't a room or hallway */}
            {cell !== "x" && cell !== " " ? cell : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
