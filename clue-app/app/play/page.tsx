"use client";

import React, { useState } from "react";
import Modal from "react-modal";
import useSWR from "swr";

import AccuseModal from "@components/AccuseModal";
import Board from "@components/Board";
import CardList from "@components/CardList";
import StayOrRollModal from "@components/StayOrRollModal";
import { BoardData } from "@constants/index";

interface ApiResponse {
  rooms: string[];
  suspects: string[];
  weapons: string[];
  board: BoardData;
  player: string;
  cards: string[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Play() {
  const { data, error } = useSWR<ApiResponse>(
    "http://127.0.0.1:5000/api/board",
    fetcher
  );

  const [isAccuseModalOpen, setIsAccuseModalOpen] = useState(false);
  const [isStayOrRollModalOpen, setIsStayOrRollModalOpen] = useState(false);
  const [rollTotal, setRollTotal] = useState<number | null>(null);

  if (error) {
    return <div className="text-red-500">Error loading board data</div>;
  }
  if (!data) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const { board, rooms, suspects, weapons, player, cards } = data;

  const openAccuseModal = () => setIsAccuseModalOpen(true);
  const closeAccuseModal = () => setIsAccuseModalOpen(false);

  const openStayOrRollModal = () => setIsStayOrRollModalOpen(true);
  const closeStayOrRollModal = () => setIsStayOrRollModalOpen(false);

  const handleRoll = (total: number) => {
    setRollTotal(total);
    // Keep the modal open to show the result
  };

  const handleStay = () => {
    // Implement stay logic if needed
    closeStayOrRollModal();
  };

  const handleBoardClick = async (x: number, y: number) => {
    if (rollTotal === null) return;

    const response = await fetch("http://127.0.0.1:5000/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y, roll: rollTotal }),
    });

    const result = await response.json();
    if (result.valid) {
      // Move player and check if in a room
      const inRoomResponse = await fetch(
        "http://127.0.0.1:5000/api/check-room",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ x, y }),
        }
      );

      const inRoomResult = await inRoomResponse.json();
      if (inRoomResult.inRoom) {
        openAccuseModal();
      }
    }
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="w-1/4 bg-gray-200 p-4">
        <div className="text-center text-lg font-semibold mb-4">
          Player: {player || "Scarlet"}
        </div>
        <CardList cards={cards} />
        <button
          className="w-full bg-blue-500 text-white py-2 rounded mb-2"
          onClick={openAccuseModal}
        >
          Final Accused
        </button>
        <button
          className="w-full bg-green-500 text-white py-2 rounded"
          onClick={openStayOrRollModal}
        >
          Take Turn
        </button>
      </div>
      <div className="flex-grow flex items-center justify-center p-8">
        <Board
          board={board}
          rooms={rooms}
          suspects={suspects}
          weapons={weapons}
          onClick={handleBoardClick}
        />
      </div>
      <AccuseModal
        isOpen={isAccuseModalOpen}
        onRequestClose={closeAccuseModal}
      />
      <StayOrRollModal
        isOpen={isStayOrRollModalOpen}
        onRequestClose={closeStayOrRollModal}
        onRoll={handleRoll}
        onStay={handleStay}
      />
    </div>
  );
}
