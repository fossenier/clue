import React from "react";

import { BOARD } from "@constants/index";

interface BoardProps {
  onTileClick: (idx: number) => void;
}

const Board: React.FC<BoardProps> = ({ onTileClick }) => {
  return (
    <div className="h-dvh w-dvw">
      {BOARD.map((row, rowIndex) => (
        <div key={`row${rowIndex}`} className="h-1/24 flex">
          {row.map((tile, tileIndex) => (
            <div
              key={rowIndex * 25 + tileIndex}
              className={`w-1/25 border-2 border-gray-300 box-border cursor-pointer text-sm font-bold text-white ${
                tile === "x"
                  ? "bg-red-600"
                  : tile === " " || tile === "door"
                    ? "bg-yellow-200"
                    : "bg-black"
              }`}
              onClick={() => onTileClick(rowIndex * 25 + tileIndex)}
            >
              {tile !== "x" && tile !== " " ? tile : ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
