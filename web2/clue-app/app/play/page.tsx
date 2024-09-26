"use client";
import React from 'react';

import { BOARD, ROOMS, SUSPECTS, WEAPONS } from '@constants/index';

export default function play() {
  const updateBoardData = (idx: number) => {
    console.log(idx);
  };

  return (
    <div>
      <div
        className={`grid w-fit h-fit`}
        style={{
          gridTemplateRows: `repeat(25, 1fr)`,
          gridTemplateColumns: `repeat(25, 1fr)`,
        }}
      >
        {BOARD.flat().map((cell, idx) => (
          <div
            onClick={() => updateBoardData(idx)}
            key={idx}
            className={`square w-6 h-6 flex items-center justify-center border-2 border-gray-300 cursor-pointer text-sm font-bold text-white ${
              cell === "x"
                ? "bg-red-600"
                : cell === " " || cell === "door"
                ? "bg-yellow-200"
                : "bg-black"
            }`}
          >
            {cell !== "x" && cell !== " " ? cell : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
