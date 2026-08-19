//Adds a unique lobby id to every game (local, AI, and online) so the game can
//be bookmarked at /game/[id] and resumed after a refresh. Local & AI games are
//stored entirely in localStorage. Online games store only a small reconnect
//session before grabbing from Firebase. We cross-check lobby id with firebase before accepting it

import type { Color } from "./chessTypes";
import type { GameConfig } from "../../components/modals/gamemode-modal";
import type { GameState } from "../../components/modals/gameover-modal";
import type { ChatMessage } from "./Chat";
import { generateGameID, getGameData } from "./multiplayer";

export interface PersistedGame {
  id: string;
  mode: "local" | "ai" | "multiplayer";
  config: GameConfig;
  gameState: GameState;
  winner?: Color;
  currentTurn: Color;
  halfMove: number;
  turn: number;
  fenHistory: string[];
  chatMessages: ChatMessage[];
  playerColor: Color;
  vsAI: boolean;
  colorAI?: Color;
  firstMove: boolean;
  enPassantHistory: string[];
  timers: { white: number; black: number };
  updatedAt: number;
}

const PREFIX = "chess_lobby:";

export const INITIAL_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

//Builds a brand new persisted game so the game page can restore it
export function createInitialPersistedGame(
  id: string,
  config: GameConfig,
): PersistedGame {
  return {
    id,
    mode: config.mode,
    config,
    gameState: "ongoing",
    currentTurn: "white",
    halfMove: 0,
    turn: 0,
    fenHistory: [INITIAL_FEN],
    chatMessages: [],
    playerColor: config.playerColor ?? "white",
    vsAI: config.mode === "ai",
    colorAI: config.playerColor === "white" ? "black" : "white",
    firstMove: true,
    enPassantHistory: [],
    timers: {
      white: config.timerEnabled === false ? 0 : (config.timerSeconds ?? 300),
      black: config.timerEnabled === false ? 0 : (config.timerSeconds ?? 300),
    },
    updatedAt: Date.now(),
  };
}

export function storageKey(id: string): string {
  return PREFIX + id;
}

export function loadPersistedGame(id: string): PersistedGame | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedGame;
  } catch {
    return null;
  }
}

export function savePersistedGame(
  game: Omit<PersistedGame, "updatedAt">,
): void {
  try {
    localStorage.setItem(
      storageKey(game.id),
      JSON.stringify({ ...game, updatedAt: Date.now() }),
    );
  } catch {
    //Nothing. TODO potential error, but won't break if try doesn't work
  }
}

//Remove info in localstorage after game ends
export function clearPersistedGame(id: string): void {
  try {
    localStorage.removeItem(storageKey(id));
  } catch {
    //Nothing. TODO potential error, but won't break if try doesn't work
  }
}

//Generates a unique lobby id and cross-checks firebase so local/ai ids never
//collide with a real online game code. Falls back to generating without a
//check if firebase can't be reached.
export async function generateUniqueLobbyID(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const id = generateGameID();
    try {
      const existing = await getGameData(id);
      if (!existing) return id;
    } catch {
      return id;
    }
  }
  return generateGameID();
}

//Parses the turn, move counters and en passant fields out of a full FEN
export function parseFen(fen: string): {
  turn: Color;
  halfMove: number;
  fullMove: number;
  enPassant: string | null;
} {
  const parts = fen.split(" ");
  return {
    turn: parts[1] === "b" ? "black" : "white",
    halfMove: parseInt(parts[4] ?? "0", 10),
    fullMove: parseInt(parts[5] ?? "1", 10),
    enPassant: parts[3] && parts[3] !== "-" ? parts[3] : null,
  };
}
