import React from "react";

import { ROOMS, SUSPECTS, WEAPONS } from "@constants/index";
import { Button, Modal, Stack } from "@mui/material";

import Cards from "./Cards";

const Panel: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="h-full w-full bg-white">
      <Stack spacing={2} direction={"column"}>
        <Button variant="contained" onClick={handleOpen}>
          My Cards
        </Button>
        <Button variant="contained">Take a Roll</Button>
        <Button variant="contained">Suggest</Button>
        <Button variant="contained">Accuse</Button>
      </Stack>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Cards />
      </Modal>
    </div>
  );
};

export default Panel;
