import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  user: defineTable({
    username: v.string(),
    hash: v.string(),
    games: v.array(v.id("game")),
  }).index("by_username", ["username"]),

  game: defineTable({
    murderer: v.array(v.string()),
    cardSidebar: v.array(v.string()),
    players: v.array(
      v.object({ username: v.string(), playerId: v.id("player") })
    ),
    activePlayer: v.id("player"),
    suggestions: v.array(v.id("suggestion")),
  }),

  player: defineTable({
    username: v.string(),
    algorithm: v.string(),
    cards: v.array(v.string()),
    suspect: v.string(),
    row: v.number(),
    col: v.number(),
    moveRoll: v.number(),
    movesLeft: v.number(),
    eliminated: v.boolean(),
    victorious: v.boolean(),
  }),

  suggestion: defineTable({
    suggester: v.id("player"),
    cards: v.array(v.string()),
    responses: v.array(v.id("response")),
  }),

  response: defineTable({
    responder: v.id("player"),
    hasCard: v.boolean(),
    card: v.string(),
  }),
});
