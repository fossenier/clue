import React from "react";

import { SUSPECTS } from "@constants/index";
import { Button } from "@mui/material";

const Roll: React.FC = () => {
  return (
    <div className="w-full h-full p-2 flex flex-col items-center">
      <div className="w-5/6 bg-indigo-300 rounded-md p-2 flex justify-center">
        <p>Movement</p>
      </div>
      <div className="p-2 flex flex-col flex-wrap gap-2 justify-center">
        <Button variant="contained">Roll</Button>
        <p className="text-black">Roll: </p>
        <p className="text-black">Moves left: </p>
      </div>
    </div>
  );
};

export default Roll;
