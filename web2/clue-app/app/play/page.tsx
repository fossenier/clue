// app/play/page.tsx

"use client";
import React from "react";

import Board from "./Board";

export default function Play() {
  const updateBoardData = (idx: number) => {
    console.log(idx);
  };

  return (
    <div>
      <Board onTileClick={updateBoardData} />
    </div>
  );
}
