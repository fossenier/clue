"use client";

import { useEffect, useState } from 'react';

type BoardData = string[][];

export default function Play() {
  const [boardData, setBoardData] = useState<BoardData>([]);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/board");
        const data: BoardData = await response.json();
        setBoardData(data);
      } catch (error) {
        console.error("Error fetching board data:", error);
      }
    };

    fetchBoardData();
  }, []);

  return (
    <div>
      <h1>Board Data</h1>
      {boardData.length > 0 ? (
        <table>
          <thead>
            <tr>
              {boardData[0].map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {boardData.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
