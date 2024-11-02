"use client";

import { useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { getCookie } from 'typescript-cookie';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';

export default function Games() {
  // State for cookies and user games
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [userGames, setUserGames] = useState<Doc<"game">[] | undefined>(
    undefined
  );

  // Fetch cookies only on the client side
  useEffect(() => {
    const session = getCookie("session-id");
    const user = getCookie("username");

    setSessionId(session);
    setUsername(user);
  }, []);

  // Fetch games if sessionId and username are available
  const queryResult = useQuery(
    api.queries.gameLoading.listGames,
    sessionId && username ? { sessionId, username } : "skip"
  );

  // Filter and set user games
  useEffect(() => {
    if (queryResult) {
      setUserGames(queryResult.filter((game) => game !== null));
    }
  }, [queryResult]);

  console.log(
    "Session ID:",
    sessionId,
    "Username:",
    username,
    "User Games:",
    userGames
  );

  return (
    <div>
      <p>Hello, {username || "Guest"}</p>
    </div>
  );
}
