import React from "react";

import { ROOMS, SUSPECTS, WEAPONS } from "@constants/index";
import { Button, Stack } from "@mui/material";

const Panel: React.FC = () => {
  return (
    <div className="h-full w-full bg-white">
      <Stack spacing={2} direction={"column"}>
        <Button variant="contained">My Cards</Button>
        <Button variant="contained">Take a Roll</Button>
        <Button variant="contained">Suggest</Button>
        <Button variant="contained">Accuse</Button>
      </Stack>
    </div>
  );
};

export default Panel;
