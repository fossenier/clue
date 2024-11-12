import React from 'react';

import { BOARD } from '@constants/index';

interface BoardProps {
  onTileSelect: (idx: number) => void;
}

const Board: React.FC<BoardProps> = ({ onTileSelect: onTileSelect }) => {
  return (
    <div className="h-full w-full">
      {BOARD.map((row, rowIndex) => (
        <div key={`row${rowIndex}`} className="h-1/24 flex">
          {row.map((tile, tileIndex) => (
            <div
              key={rowIndex * 25 + tileIndex}
              className={`w-1/25 border-2 border-gray-300 box-border cursor-pointer text-sm overflow-hidden whitespace-nowrap font-bold text-white ${
                tile === "x"
                  ? "bg-red-600"
                  : tile === " " || tile === "door"
                    ? "bg-yellow-200"
                    : "bg-black"
              }`}
              onClick={() => onTileSelect(rowIndex * 25 + tileIndex)}
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
