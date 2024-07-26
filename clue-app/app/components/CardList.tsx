import React from "react";

interface CardListProps {
  cards: string[];
}

const CardList: React.FC<CardListProps> = ({ cards }) => (
  <div className="grid grid-cols-3 gap-2 mb-4">
    {cards &&
      cards.map((card, index) => (
        <div
          key={index}
          className="bg-white p-2 border rounded text-center shadow"
        >
          {card}
        </div>
      ))}
  </div>
);

export default CardList;
