import React, { useEffect } from "react";

import { ROOMS, SUSPECTS, WEAPONS } from "@constants/index";
import { Button, FormControl, InputLabel, MenuItem } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";

const Suggest: React.FC = () => {
  const [room, setRoom] = React.useState<string>("");
  const [suspect, setSuspect] = React.useState<string>("");
  const [weapon, setWeapon] = React.useState<string>("");

  const [incomplete, setIncomplete] = React.useState<boolean>(false);

  const selectRoom = (event: SelectChangeEvent) => {
    // Set the room to the user selected one
    setRoom(event.target.value as string);
  };
  const selectSuspect = (event: SelectChangeEvent) => {
    // Set the suspect to the user selected one
    setSuspect(event.target.value as string);
  };
  const selectWeapon = (event: SelectChangeEvent) => {
    // Set the weapon to the user selected one
    setWeapon(event.target.value as string);
  };

  const raiseEmptyFieldsError = () => {
    if (room && suspect && weapon) {
      setIncomplete(false);
    } else {
      setIncomplete(true);
    }
  };

  const makeSuggestion = () => {
    raiseEmptyFieldsError();
  };

  const makeAccusation = () => {
    raiseEmptyFieldsError();
  };

  useEffect(() => {
    if (room && suspect && weapon) {
      setIncomplete(false);
    }
  }, [room, suspect, weapon]);

  return (
    <div className="w-full h-full p-2 flex flex-col items-center">
      <div className="w-5/6 bg-indigo-300 rounded-md p-2 flex justify-center">
        <p>Suggest or Accuse</p>
      </div>
      <div className="w-5/6 p-4 flex flex-col items-center gap-2">
        <FormControl fullWidth className="">
          <InputLabel id="room-label">Room</InputLabel>
          <Select
            labelId="room-label"
            id="room-select"
            value={room}
            label="Room"
            onChange={selectRoom}
          >
            {ROOMS.map((room, roomIndex) => (
              <MenuItem key={`room${roomIndex}`} value={room}>
                {room}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth className="">
          <InputLabel id="suspect-label">Suspect</InputLabel>
          <Select
            labelId="suspect-label"
            id="suspect-select"
            value={suspect}
            label="Suspect"
            onChange={selectSuspect}
          >
            {SUSPECTS.map((suspect, suspectIndex) => (
              <MenuItem key={`suspect${suspectIndex}`} value={suspect}>
                {suspect}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth className="">
          <InputLabel id="weapon-label">Weapon</InputLabel>
          <Select
            labelId="weapon-label"
            id="weapon-select"
            value={weapon}
            label="Suspect"
            onChange={selectWeapon}
          >
            {WEAPONS.map((weapon, weaponIndex) => (
              <MenuItem key={`weapon${weaponIndex}`} value={weapon}>
                {weapon}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {incomplete ? (
          <p className="text-center text-red-600">
            You must select: {room ? "" : "room "} {suspect ? "" : "suspect "}
            {weapon ? "" : "weapon "}
          </p>
        ) : (
          <p></p>
        )}

        <Button variant="contained" onClick={makeSuggestion}>
          Suggest
        </Button>
        <Button variant="contained" onClick={makeAccusation}>
          Accuse
        </Button>
      </div>
    </div>
  );
};

export default Suggest;
