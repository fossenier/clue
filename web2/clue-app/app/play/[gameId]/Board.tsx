import React from "react";

import { BOARD } from "@constants/index";

export interface PlayerData {
  username: string;
  row: number;
  col: number;
}

export interface BoardProps {
  onTileSelect: (tile: any) => void;
  players: Record<string, PlayerData>; // key is suspect
}

const Board: React.FC<BoardProps> = ({ onTileSelect, players }) => {
  const tileBackground = (tile: string, row: number, col: number) => {
    for (const player in players) {
      if (players[player].row === row && players[player].col === col) {
        return "bg-green-500";
      }
    }

    if (tile === "x") {
      return "bg-red-600";
    } else if (tile === " ") {
      return "bg-yellow-200";
    } else {
      return "bg-black";
    }
  };

  const tileText = (tile: string, row: number, col: number) => {
    for (const player in players) {
      if (players[player].row === row && players[player].col === col) {
        return player;
      }
    }

    return tile !== "x" && tile !== " " ? tile : "";
  };

  return (
    <div className="h-full w-full">
      {BOARD.map((row, rowIdx) => (
        <div key={`row${rowIdx}`} className="h-1/24 flex">
          {row.map((tile, colIdx) => (
            <div
              key={rowIdx * 25 + colIdx}
              className={`w-1/25 border-2 border-gray-300 box-border cursor-pointer text-sm overflow-hidden whitespace-nowrap font-bold text-white
                ${tileBackground(tile, rowIdx, colIdx)}`}
              onClick={() => onTileSelect(rowIdx * 25 + colIdx)}
            >
              {tileText(tile, rowIdx, colIdx)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
