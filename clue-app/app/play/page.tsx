"use client";

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

  if (error) return <div>Error loading board data</div>;
  if (!data) return <div>Loading...</div>;

  const { board } = data;

  return (
    <div>
      <h1>Board Data</h1>
      <table>
        <tbody>
          {board.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
