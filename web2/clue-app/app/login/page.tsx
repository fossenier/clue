"use client";
import { compare, genSalt, hash } from "bcrypt-ts";
import React, { useState } from "react";

import { Button, TextField } from "@mui/material";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const register = () => {
    genSalt(10)
      .then((salt) => hash(password, salt))
      .then((hash) => {
        // Store hash in your password DB.
      });
  };

  const login = () => {
    // Load hash from your password DB.
    const hash = "xxxxxx";

    compare("B4c0//", hash).then((result) => {
      // result is `true`
    });
    compare("not_bacon", hash).then((result) => {
      // result is `false`
    });
  };

  return (
    <div className="h-dvh w-dvw flex flex-row justify-center items-center bg-white">
      <div className="h-80 w-80 flex flex-col items-center gap-2 bg-periwinkle rounded-3xl">
        <p className="font-bold font-sans text-4xl p-6 text-chartreuse">
          Login
        </p>
        <TextField
          id="username"
          label="Username"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          variant="outlined"
        ></TextField>
        <TextField
          id="password"
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          variant="outlined"
          type="password"
          error={false}
        ></TextField>
        <Button variant="contained" onClick={login}></Button>
        <p>login</p>
      </div>
    </div>
  );
}
