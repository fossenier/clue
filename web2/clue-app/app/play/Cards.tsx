import React from "react";

const Cards: React.FC = () => {
  return (
    <div className="w-full h-full p-2 flex flex-col items-center">
      <div className="w-5/6 bg-indigo-300 rounded-md p-2 flex justify-center">
        <p>My Cards</p>
      </div>
      <div className="flex flex-row justify-center">
        <p>One</p>
        <p>Two</p>
        <p>Three</p>
      </div>
    </div>
  );
};

export default Cards;
