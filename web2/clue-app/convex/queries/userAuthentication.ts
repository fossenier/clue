"use server";

import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import { ConvexError, v } from "convex/values";

import { query } from "../_generated/server";

// Logs a user in based on their account in the system
export const loginUser = query({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate username requirements
    if (args.username.length < 6) {
      throw new ConvexError({
        message: "Username is too short",
        serverUsernameError: true,
        serverPasswordError: false,
      });
    }

    // Validate password requirements
    if (args.password.length < 8) {
      throw new ConvexError({
        message: "Password must be at least 8 characters.",
        serverUsernameError: false,
        serverPasswordError: true,
      });
    }

    // Get the user's account to login to
    const existingUser = await ctx.db
      .query("user")
      .withIndex("by_username")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();

    // Attempt to log this user in
    if (existingUser) {
      // Check their password against their hash
      if (compareSync(args.password, existingUser.hash)) {
        // Return the hashed userId to stamp as a cookie on the client for auth
        const salt = genSaltSync(10);
        return hashSync(existingUser._id, salt);
      } else {
        // Their password is incorrect, so don't log them in
        throw new ConvexError({
          message: "Incorrect username or password.",
          serverUsernameError: false,
          serverPasswordError: false,
        });
      }
    } else {
      // The user doesn't exist, so don't log them in
      throw new ConvexError({
        message: "Incorrect username or password.",
        serverUsernameError: false,
        serverPasswordError: false,
      });
    }
  },
});
