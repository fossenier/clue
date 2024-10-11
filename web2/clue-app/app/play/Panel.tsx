import React from "react";

import { ROOMS, SUSPECTS, WEAPONS } from "@constants/index";
import { Button, Stack } from "@mui/material";

import Cards from "./Cards";
import Roll from "./Roll";
import Suggest from "./Suggest";

const Panel: React.FC = () => {
  return (
    <div className="h-full w-full bg-white">
      <Stack spacing={2} direction={"column"}>
        <Cards></Cards>
        <Roll></Roll>
        <Suggest></Suggest>
        <Button variant="contained">Accuse</Button>
      </Stack>
    </div>
  );
};

export default Panel;
