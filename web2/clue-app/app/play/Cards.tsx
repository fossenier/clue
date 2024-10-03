import React from "react";

import { SUSPECTS } from "@constants/index";

const Cards: React.FC = () => {
  return (
    <div className="w-full h-full p-2 flex flex-col items-center">
      <div className="w-5/6 bg-indigo-300 rounded-md p-2 flex justify-center">
        <p>My Cards</p>
      </div>
      <div className="p-2 flex flex-row flex-wrap gap-2 justify-center">
        {SUSPECTS.map((suspect, suspectIndex) => (
          <div
            key={`suspect${suspectIndex}`}
            className="bg-blue-400 rounded-lg p-1"
          >
            <p>{suspect}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards;
