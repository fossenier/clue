"use client";

import React from "react";
import useSWR from "swr";

import Board from "@components/board";
import { BoardData } from "@constants/index";

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

  const { board, rooms, suspects, weapons } = data;

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center p-8">
      <Board
        board={board}
        rooms={rooms}
        suspects={suspects}
        weapons={weapons}
      />
    </div>
  );
}
