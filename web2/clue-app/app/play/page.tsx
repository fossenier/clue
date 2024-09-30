"use client";
import React from "react";

import Board from "./Board";

export default function Play() {
  const updateBoardData = (idx: number) => {
    console.log(idx);
  };

  return (
    <div className="flex h-dvh w-dvw">
      <div className="w-1/6 bg-white">
        <p>ayy</p>
      </div>
      <div className="w-5/6">
        <Board onTileClick={updateBoardData} />
      </div>
    </div>
  );
}
