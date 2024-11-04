"use server";

import { MutationCtx } from '../_generated/server';

export async function createPlayer(
  ctx: MutationCtx,
  username: string,
  algorithm: string,
  cards: string[],
  suspect: string,
  row: number,
  col: number
) {
  console.log("createPlayer");
  const playerId = await ctx.db.insert("player", {
    username,
    algorithm,
    cards,
    suspect,
    row,
    col,
    moveRoll: 0,
    movesLeft: 0,
    eliminated: false,
    victorious: false,
  });

  return playerId;
}
