"use client";

import "./styles.play.sass";

import React from "react";
import useSWR from "swr";

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

  if (error) return <div>Error loading board data</div>;
  if (!data) return <div>Loading...</div>;

  const { board } = data;

  const getMaxLength = (data: BoardData) => {
    let maxLength = 0;
    data.forEach((row) => {
      row.forEach((cell) => {
        if (cell.length > maxLength) {
          maxLength = cell.length;
        }
      });
    });
    return maxLength;
  };

  const getBackgroundClass = (cell: string) => {
    if (cell === "x") return "wall"; // Red for walls
    if (cell === " ") return "hallway"; // Light gray for hallways
    // Assuming rooms, suspects, and weapons are predefined lists
    if (data.rooms.includes(cell)) return "room"; // Light blue for rooms
    if (data.suspects.includes(cell)) return "suspect"; // Green for suspects
    if (data.weapons.includes(cell)) return "weapon"; // Orange for weapons
    return "default"; // Default white background
  };

  const maxLength = getMaxLength(board);

  return (
    <div className="board-container">
      <h1>Board Data</h1>
      <div>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={`board-cell ${getBackgroundClass(cell)}`}
                style={{
                  width: `${maxLength + 2}ch`,
                  height: "3em",
                  lineHeight: "3em",
                }}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
