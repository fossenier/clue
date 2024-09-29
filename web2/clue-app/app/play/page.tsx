"use client";
import React from "react";

import { BOARD, ROOMS, SUSPECTS, WEAPONS } from "@constants/index";

export default function play() {
  const updateBoardData = (idx: number) => {
    console.log(idx);
  };

  return (
    <div className="h-dvh w-dvw">
      {BOARD.map((row, rowIndex) => (
        <div key={`row${rowIndex}`} className="h-1/24 flex">
          {row.map((tile, tileIndex) => (
            <div
              key={rowIndex * 24 + tileIndex}
              className={`w-1/25 border-2 border-gray-300 box-border cursor-pointer text-sm font-bold text-white ${
                // Set the tile's colour based on the contents of the tile
                tile === "x"
                  ? "bg-red-600"
                  : tile === " " || tile === "door"
                    ? "bg-yellow-200"
                    : "bg-black"
              }`}
            >
              {tile !== "x" && tile !== " " ? tile : ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
