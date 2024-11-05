"use server";

import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import { ConvexError, v } from "convex/values";

import { mutation } from "../_generated/server";
import { fetchUser } from "../authHelpers";

// Creates a user account in the system
export const registerUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate password requirements
    if (args.password.length < 8) {
      throw new ConvexError({
        message: "Password must be at least 8 characters.",
        serverUsernameError: false,
        serverPasswordError: true,
      });
    }

    // Tell users if the username is in use (duplicates is bad)
    const existingUser = await fetchUser(ctx, args.username);

    if (existingUser) {
      throw new ConvexError({
        message: "Username already in use. Please choose another one.",
        serverUsernameError: true,
        serverPasswordError: false,
      });
    }

    // Hash the password
    const salt = genSaltSync(10);
    const hash = hashSync(args.password, salt);

    const userId = await ctx.db.insert("user", {
      username: args.username,
      hash: hash,
      games: [],
    });

    // Return the hashed userId to stamp as a cookie on the client for auth
    return hashSync(userId, salt);
  },
});

// Logs a user in based on their account in the system
export const loginUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate password requirements
    if (args.password.length < 8) {
      throw new ConvexError({
        message: "Password must be at least 8 characters.",
        serverUsernameError: false,
        serverPasswordError: true,
      });
    }

    // Get the user's account to login to
    const existingUser = await fetchUser(ctx, args.username);

    // The user must exist to login
    if (!existingUser) {
      throw new ConvexError({
        message: "Incorrect username or password.",
        serverUsernameError: false,
        serverPasswordError: false,
      });
    }

    // The password must match the hash to login
    if (!compareSync(args.password, existingUser.hash)) {
      throw new ConvexError({
        message: "Incorrect username or password.",
        serverUsernameError: false,
        serverPasswordError: false,
      });
    }

    // Return the hashed userId to stamp as a cookie on the client for auth
    const salt = genSaltSync(10);
    return hashSync(existingUser._id, salt);
  },
});
