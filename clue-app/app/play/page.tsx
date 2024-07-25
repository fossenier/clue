"use client";

import './styles.play.sass';

import React from 'react';
import useSWR from 'swr';

type BoardData = string[][];

interface ApiResponse {
  rooms: string[];
  suspects: string[];
  weapons: string[];
  board: BoardData;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Play() {
  const { data, error } = useSWR<ApiResponse>(
    "http://127.0.0.1:5000/api/board",
    fetcher
  );

  if (error)
    return <div className="text-red-500">Error loading board data</div>;
  if (!data) return <div className="text-gray-500">Loading...</div>;

  const { board } = data;

  const getBackgroundClass = (cell: string) => {
    if (cell === "Passage") return "wall";
    if (cell === "x") return "wall";
    if (cell === " ") return "hallway";
    if (data.rooms.includes(cell)) return "room";
    if (data.suspects.includes(cell)) return "suspect";
    if (data.weapons.includes(cell)) return "weapon";
    return "default";
  };

  const numRows = board.length;
  const numCols = board[0].length;

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center p-8">
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
              className={`board-cell ${getBackgroundClass(
                cell
              )} flex items-center justify-center text-center overflow-hidden`}
            >
              <span className="text-xs xl:text-base truncate">{cell}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
