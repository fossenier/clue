"use client";

import React from "react";

import Board from "./Board";
import Panel from "./Panel";

export default function Play() {
  const selectBoardTile = (idx: number) => {
    console.log(`Selected row ${Math.floor(idx / 25)} and column ${idx % 25}`);
  };

  return (
    <div className="flex h-dvh w-dvw">
      <div className="w-1/6">
        <Panel />
      </div>
      <div className="w-5/6">
        <Board onTileClick={selectBoardTile} />
      </div>
    </div>
  );
}
