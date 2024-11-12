import React from "react";

import { SUSPECTS } from "@constants/index";

interface CardsProps {
  cardSourceName: string;
  sourceCards: string[];
}

const Cards: React.FC<CardsProps> = ({
  cardSourceName: cardSourceName,
  sourceCards: sourceCards,
}) => {
  return (
    <div className="w-full h-full p-2 flex flex-col items-center">
      <div className="w-5/6 bg-indigo-300 rounded-md p-2 flex justify-center">
        <p>{cardSourceName}</p>
      </div>
      <div className="p-2 flex flex-row flex-wrap gap-2 justify-center">
        {sourceCards.map((card, cardIndex) => (
          <div key={`card${cardIndex}`} className="bg-blue-400 rounded-lg p-1">
            <p>{card}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards;
