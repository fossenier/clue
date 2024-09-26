"use client";

import Head from "next/head";
import React, { useEffect, useState } from "react";

const WINNING_COMBO = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const Page: React.FC = () => {
  const [xTurn, setXTurn] = useState(true);
  const [won, setWon] = useState(false);
  const [wonCombo, setWonCombo] = useState<number[]>([]);
  const [boardData, setBoardData] = useState<{ [key: number]: string }>({
    0: "",
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
  });
  const [isDraw, setIsDraw] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    checkWinner();
    checkDraw();
  }, [boardData]);

  const updateBoardData = (idx: number) => {
    if (!boardData[idx] && !won) {
      const value = xTurn ? "X" : "O";
      setBoardData({ ...boardData, [idx]: value });
      setXTurn(!xTurn);
    }
  };

  const checkDraw = () => {
    const isBoardFull = Object.keys(boardData).every(
      (key) => boardData[parseInt(key)]
    );
    setIsDraw(isBoardFull);
    if (isBoardFull) setModalTitle("Match Draw!!!");
  };

  const checkWinner = () => {
    WINNING_COMBO.forEach((combo) => {
      const [a, b, c] = combo;
      if (
        boardData[a] &&
        boardData[a] === boardData[b] &&
        boardData[a] === boardData[c]
      ) {
        setWon(true);
        setWonCombo(combo);
        setModalTitle(`Player ${!xTurn ? "X" : "O"} Won!!!`);
      }
    });
  };

  const reset = () => {
    setBoardData({
      0: "",
      1: "",
      2: "",
      3: "",
      4: "",
      5: "",
      6: "",
      7: "",
      8: "",
    });
    setXTurn(true);
    setWon(false);
    setWonCombo([]);
    setIsDraw(false);
    setModalTitle("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Head>
        <title>Tic Tac Toe</title>
      </Head>
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Tic Tac Toe</h1>
      <div className="game">
        <div className="game__menu flex justify-between mb-4 text-gray-800">
          <p className="text-xl font-semibold">{xTurn ? "X Turn" : "O Turn"}</p>
          <p className="text-xl font-semibold">{`Game Won: ${won} Draw: ${isDraw}`}</p>
        </div>
        <div className="game__board grid grid-cols-3 gap-4">
          {[...Array(9)].map((_, idx) => (
            <div
              onClick={() => updateBoardData(idx)}
              key={idx}
              className={`square w-24 h-24 flex items-center justify-center bg-white border-2 border-gray-300 cursor-pointer text-2xl font-bold text-gray-800 ${
                wonCombo.includes(idx) ? "bg-green-200" : ""
              }`}
            >
              {boardData[idx]}
            </div>
          ))}
        </div>
      </div>
      {modalTitle && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="modal__title text-2xl font-bold mb-4 text-gray-800">
              {modalTitle}
            </div>
            <button
              onClick={reset}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
