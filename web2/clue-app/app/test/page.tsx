"use client";
import React from "react";

import { BOARD } from "@constants/index";

export default function test() {
  return (
    <div className="h-dvh w-dvw">
      {BOARD.map((row, rowIndex) => (
        <div key={`row${rowIndex}`} className="h-1/24 flex shrink bg-blue-500">
          {row.map((tile, tileIndex) => (
            <div
              key={rowIndex * 24 + tileIndex}
              className="w-1/25 border-2 box-border bg-yellow-500"
            >
              {tile}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
