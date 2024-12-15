/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as authHelpers from "../authHelpers.js";
import type * as boardHelpers from "../boardHelpers.js";
import type * as clue_gameLogic from "../clue/gameLogic.js";
import type * as gameHelpers from "../gameHelpers.js";
import type * as generalHelpers from "../generalHelpers.js";
import type * as mutations_gameActions from "../mutations/gameActions.js";
import type * as mutations_playerActions from "../mutations/playerActions.js";
import type * as mutations_userAuthentication from "../mutations/userAuthentication.js";
import type * as playerHelpers from "../playerHelpers.js";
import type * as queries_gameLoading from "../queries/gameLoading.js";
import type * as queries_playerLoading from "../queries/playerLoading.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  authHelpers: typeof authHelpers;
  boardHelpers: typeof boardHelpers;
  "clue/gameLogic": typeof clue_gameLogic;
  gameHelpers: typeof gameHelpers;
  generalHelpers: typeof generalHelpers;
  "mutations/gameActions": typeof mutations_gameActions;
  "mutations/playerActions": typeof mutations_playerActions;
  "mutations/userAuthentication": typeof mutations_userAuthentication;
  playerHelpers: typeof playerHelpers;
  "queries/gameLoading": typeof queries_gameLoading;
  "queries/playerLoading": typeof queries_playerLoading;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
