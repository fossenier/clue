import React from "react";

import { BoardData } from "@constants/index";

interface BoardProps {
  board: BoardData;
  rooms: string[];
  suspects: string[];
  weapons: string[];
  onClick: (x: number, y: number) => void;
}

const Board: React.FC<BoardProps> = ({
  board,
  rooms,
  suspects,
  weapons,
  onClick,
}) => {
  const getBackgroundClass = (cell: string) => {
    if (cell === "Passage") return "bg-red-500";
    if (cell === "x") return "bg-red-500";
    if (cell === " ") return "bg-gray-100";
    if (rooms.includes(cell)) return "bg-cyan-400";
    if (suspects.includes(cell)) return "bg-green-500";
    if (weapons.includes(cell)) return "bg-orange-400";
    return "bg-white";
  };

  const numRows = board.length;
  const numCols = board[0].length;

  return (
    <div
      className={`grid gap-1 w-full h-full`}
      style={{
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
        gridTemplateColumns: `repeat(${numCols}, 1fr)`,
      }}
    >
      {board.flatMap((row, rowIndex) =>
        row.map((cell, cellIndex) => (
          <div
            key={`${rowIndex}-${cellIndex}`}
            className={`${getBackgroundClass(
              cell
            )} flex items-center justify-center text-center overflow-hidden`}
            onClick={() => onClick(cellIndex, rowIndex)}
          >
            <span className="text-xs xl:text-base">{cell}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default Board;
