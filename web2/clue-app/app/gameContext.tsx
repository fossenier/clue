"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

import { Doc } from "@/convex/_generated/dataModel";

interface GameContext {
  gameData?: Doc<"game">;
  setGameData: (data: Doc<"game">) => void;
}

const GameContext = createContext<GameContext | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [gameData, setGameData] = useState<Doc<"game"> | undefined>(undefined);

  return (
    <GameContext.Provider
      value={{ gameData: gameData, setGameData: setGameData }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = (): GameContext => {
  const context = useContext(GameContext);
  if (!context)
    throw new Error("useGameContext must be used within a GameProvider");
  return context;
};
