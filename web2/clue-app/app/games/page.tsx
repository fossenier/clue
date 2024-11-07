"use client";

import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCookie } from 'typescript-cookie';

import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { SUSPECTS } from '@constants/index';
import { algorithms } from '@convex/clue/gameLogic';
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import { useGameContext } from '../gameContext';

const Games: React.FC = () => {
  // Routing and context management
  const router = useRouter();
  const { setGameData } = useGameContext();

  // Session Id and username from cookies
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);
  // Convex handed games for this user
  const [userGames, setUserGames] = useState<Doc<"game">[] | undefined>(
    undefined
  );

  // Players being chosen for the new game
  const [players, setPlayers] = useState([
    { username: "", algorithm: "", suspect: "" },
  ]);
  // Game creation validation error message
  const [error, setError] = useState<string>("");

  // Queried games for the current user
  const queryResult = useQuery(
    api.queries.gameLoading.listGames,
    sessionId && username ? { sessionId, username } : "skip"
  );
  // Mutation to create a new game
  const createGame = useMutation(api.mutations.gameActions.createGame);
  // Mutation to remove a game
  const removeGame = useMutation(api.mutations.gameActions.removeGame);

  // Load session and username from cookies first thing
  useEffect(() => {
    const session = getCookie("session-id");
    const username = getCookie("username");
    setSessionId(session);
    setUsername(username);
    setPlayers([
      { username: username ? username : "", algorithm: "", suspect: "" },
    ]);
  }, []);

  // Show the user's games when the Convex query returns
  useEffect(() => {
    if (queryResult) {
      setUserGames(queryResult.filter((game) => game !== null));
    }
  }, [queryResult]);

  // Allow additional players to be added to the game
  const handleAddPlayer = () => {
    // Limit 6!
    if (players.length < 6) {
      setPlayers([...players, { username: "", algorithm: "", suspect: "" }]);
    } else {
      setError("Maximum of 6 players allowed.");
    }
  };

  // Allow players to be removed from the game
  const handleRemovePlayer = (index: number) => {
    // Minimum 3!
    if (players.length > 3) {
      setPlayers(players.filter((_, i) => i !== index));
      setError("");
    } else {
      setError("Minimum of 3 players required.");
    }
  };

  // Updates the username / algorithm / suspect for a player
  const handleChange = (index: number, field: string, value: string) => {
    const updatedPlayers = players.map((player, i) => {
      if (i === index) {
        if (field === "algorithm" && value === "deselect") {
          // If the user deselects the algorithm, clear the field
          return { ...player, [field]: "" };
        } else {
          // At the given index, update the specified field
          return { ...player, [field]: value };
        }
      } else {
        // Only one player can use a suspect, so clear it from others
        if (field === "suspect" && player.suspect === value) {
          return { ...player, [field]: "" };
        } else {
          return player;
        }
      }
    });
    setPlayers(updatedPlayers);
  };

  // Call the Convex mutation to create a new game
  const handleCreateGame = async () => {
    const validPlayers = players.filter(
      (player) => player.suspect && (player.username || player.algorithm)
    );
    if (validPlayers.length >= 3 && sessionId && username) {
      await createGame({
        sessionId,
        username,
        players: validPlayers.map((p) => {
          return {
            username: p.username,
            algorithm: p.algorithm,
            suspect: p.suspect.toLowerCase(),
          };
        }),
      });
      setError("");
      // TODO LOGAN: Route player to the created game
    } else {
      setError(
        "Each player needs a suspect, and then username / algorithm picked."
      );
    }
  };

  // Call the Convex mutation to remove a game
  const handleRemoveGame = async (gameId: Id<"game">) => {
    if (sessionId && username && gameId) {
      await removeGame({
        sessionId: sessionId,
        username: username,
        gameId: gameId,
      });
    }
  };

  const handlePlayGame = (game: Doc<"game">) => {
    setGameData(game);
    router.push(`/play/${game._id}`);
  };

  return (
    <div className="h-dvh w-dvw bg-white p-4 flex flex-col items-center">
      <div className="w-1/3 bg-indigo-300 rounded-md p-2 flex justify-center">
        <p>My Games</p>
      </div>
      <Stack spacing={2} alignItems={"center"} className="w-full p-4">
        {userGames ? (
          userGames.map((game) => (
            <Stack
              key={game._id.toString()}
              spacing={2}
              direction="row"
              className="w-3/4"
            >
              <div
                key={game._id.toString()}
                className="w-5/6 bg-blue-400 rounded-lg p-1"
              >
                <p>Name: {game._id}</p>
                <p>Created: {new Date(game._creationTime).toLocaleString()}</p>
              </div>
              <Button
                variant="contained"
                color="secondary"
                className="w-1/6"
                onClick={() => handlePlayGame(game)}
              >
                Play
              </Button>
              <Button
                variant="contained"
                color="secondary"
                className="w-1/6"
                onClick={() => handleRemoveGame(game._id)}
              >
                Delete
              </Button>
            </Stack>
          ))
        ) : (
          <p className="text-black">Loading games...</p>
        )}

        <div className="w-1/3 bg-indigo-300 rounded-md p-2 flex justify-center">
          <p>Create Game</p>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {players.map((player, index) => (
          <Stack key={index} spacing={2} direction="row" className="w-3/4">
            <TextField
              className="w-1/3"
              disabled={index === 0 || player.algorithm !== ""}
              label={player.algorithm === "" ? "Username" : ""}
              onChange={(e) => handleChange(index, "username", e.target.value)}
              value={player.username}
              variant="outlined"
            />
            <FormControl className="w-1/3">
              <InputLabel>{index === 0 ? "" : "Algorithm"}</InputLabel>
              <Select
                value={player.algorithm}
                onChange={(e) =>
                  handleChange(index, "algorithm", e.target.value)
                }
                disabled={index === 0 || player.username !== ""}
              >
                {[...algorithms, "deselect"].map((algo) => (
                  <MenuItem key={algo} value={algo}>
                    {algo.charAt(0).toUpperCase() + algo.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="w-1/3">
              <InputLabel>Suspect</InputLabel>
              <Select
                value={player.suspect}
                onChange={(e) => handleChange(index, "suspect", e.target.value)}
              >
                {SUSPECTS.map((suspect) => (
                  <MenuItem key={suspect} value={suspect}>
                    {suspect}
                  </MenuItem>
                ))}
                ;
              </Select>
            </FormControl>
            {index > 0 && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleRemovePlayer(index)}
              >
                Remove
              </Button>
            )}
          </Stack>
        ))}
        <Button variant="outlined" onClick={handleAddPlayer}>
          Add Player
        </Button>

        <Button
          variant="contained"
          onClick={handleCreateGame}
          className="w-1/4"
        >
          Create New Game
        </Button>
      </Stack>
    </div>
  );
};

export default Games;
