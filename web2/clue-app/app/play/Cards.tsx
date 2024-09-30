import React from "react";

import { Box, Typography } from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Cards: React.FC = () => {
  return (
    <Box sx={style}>
      <p className="text-black">Title baby</p>
    </Box>
  );
};

export default Cards;
