"use client";
import { compare, genSalt, genSaltSync, hash, hashSync } from "bcrypt-ts";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import Error from "next/error";
import React, { useState } from "react";

import { api } from "@/convex/_generated/api";
import { Button, TextField } from "@mui/material";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [buttonError, setButtonError] = useState<boolean>(false);

  const isUsernameValid = (): boolean => {
    if (username.length >= 6) {
      setUsernameError("");
      return true;
    } else {
      setUsernameError("Username must be 6 or more characters");
      return false;
    }
  };

  const isPasswordValid = (): boolean => {
    if (password.length >= 8) {
      setPasswordError("");
      return true;
    } else {
      setPasswordError("Password must be 8 or more characters");
      return false;
    }
  };

  const registerUser = useMutation(
    api.mutations.userAuthentication.registerUser
  );

  const handleRegister = async (): Promise<void> => {
    if (usernameError != "" || passwordError != "") {
      setButtonError(true);
      return;
    }
    setButtonError(false);

    try {
      const userId: string = await registerUser({ username, password });
      console.log(`User registered with ID: ${userId}`);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message, serverUsernameError, serverPasswordError } =
          error.data as {
            message: string;
            serverUsernameError: boolean;
            serverPasswordError: boolean;
          };
        setUsernameError(serverUsernameError ? message : usernameError);
        setPasswordError(serverPasswordError ? message : passwordError);
        console.log(`unhappy :( -> ${message}`);
      } else {
        console.log("An unknown error occurred");
      }
    }
  };

  return (
    <div className="h-dvh w-dvw flex flex-row justify-center items-center bg-white">
      <div className="py-8 px-12 flex flex-col items-center gap-2 bg-periwinkle rounded-3xl">
        <p className="font-bold font-sans text-4xl text-chartreuse">Register</p>
        <TextField
          error={usernameError != ""}
          helperText={usernameError}
          id="username"
          label="Username"
          onChange={(e) => setUsername(e.target.value)}
          onBlur={isUsernameValid}
          value={username}
          variant="outlined"
        ></TextField>
        <TextField
          error={passwordError != ""}
          helperText={passwordError}
          id="password"
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
          onBlur={isPasswordValid}
          type="password"
          value={password}
          variant="outlined"
          className="flex-1"
        ></TextField>
        <p className="text-red-600">
          {buttonError ? "Username or password invalid." : ""}
        </p>
        <Button variant="contained" onClick={handleRegister}>
          Submit
        </Button>
      </div>
    </div>
  );
}
