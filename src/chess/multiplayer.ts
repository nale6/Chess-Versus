import {
  ref,
  set,
  onValue,
  update,
  off,
  get,
  push,
  onChildAdded,
} from "firebase/database";
import { database } from "../../backend/firebase";
import { getAuth } from "firebase/auth";
import type { Color } from "./chessTypes";
import type { ChatMessage } from "./Chat";
import type { GameState } from "../../components/modals/gameover-modal";

//Random room code
export function generateGameID(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

//Generate a random user id to identify the player
export function generateUserID(): string {
  return Math.random().toString(36).substring(2, 12);
}

//Create a new game and return the game id
export async function createGame(
  gameId: string,
  userId: string,
  playerColor: "white" | "black",
  timerSeconds: number,
  timerIncrement: number,
): Promise<void> {
  const gameRef = ref(database, `games/${gameId}`);
  await set(gameRef, {
    playerWhite: playerColor === "white" ? userId : null,
    playerBlack: playerColor === "black" ? userId : null,
    currentTurn: "white",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    status: "waiting",
    lastMove: null,
    createdAt: Date.now(),
    timerSeconds,
    timerIncrement,
  });
}

//Join an existing game
export async function joinGame(
  gameId: string,
  userId: string,
): Promise<{ success: boolean; assignedColor: "white" | "black" | null }> {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);
  const data = snapshot.val();

  if (!data) {
    return { success: false, assignedColor: null };
  }
  if (data.status !== "waiting") {
    return { success: false, assignedColor: null };
  }

  const assignedColor: "white" | "black" | null = !data.playerWhite
    ? "white"
    : !data.playerBlack
      ? "black"
      : null;

  //Room full
  if (!assignedColor) {
    return { success: false, assignedColor: null };
  }

  await update(gameRef, {
    playerWhite: assignedColor === "white" ? userId : data.playerWhite,
    playerBlack: assignedColor === "black" ? userId : data.playerBlack,
    status: "ongoing",
  });

  return { success: true, assignedColor };
}

//Post move to Firebase
export async function postMove(
  gameId: string,
  fen: string,
  currentTurn: "white" | "black",
  lastMove: string,
  gameState: GameState,
  winner?: Color | null,
): Promise<void> {
  const gameRef = ref(database, `games/${gameId}`);
  await update(gameRef, {
    fen,
    currentTurn,
    lastMove,
    updatedAt: Date.now(), //Timestamp for move
    gameState,
    winner: winner ?? null,
    status: gameState === "ongoing" ? "ongoing" : "finished",
  });
}

export async function postDrawForfeit(
  gameId: string,
  action: "draw_offer" | "draw_accept" | "draw_decline" | "forfeit",
  color: Color,
): Promise<void> {
  const gameRef = ref(database, `games/${gameId}`);
  await update(gameRef, {
    draw: action,
    drawBy: color,
  });
}

//Listen for changes to gamestate
export function listenToGame(
  gameId: string,
  callback: (data: GameData) => void,
): () => void {
  const gameRef = ref(database, `games/${gameId}`);

  const unsubscribe = onValue(gameRef, (snapshot) => {
    //Read fresh from snapshot
    const data = snapshot.val();
    if (data) callback(data);
  });
  //onValue returns unsubscribe function directly
  return unsubscribe;
}

export function getCurrentUserID(): string {
  return getAuth().currentUser?.uid ?? "";
}

export async function getAvailableColor(
  gameId: string,
): Promise<"white" | "black" | null> {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);
  const data = snapshot.val();

  if (!data) return null; //Game doesn't exist

  if (!data.playerWhite) return "white";
  if (!data.playerBlack) return "black";
  return null; //slots taken
}

export async function postChatMessage(
  gameId: string,
  entry: ChatMessage,
): Promise<void> {
  const chatRef = ref(database, `games/${gameId}/chat`);
  //Generates a unique key, keeps entries ordered
  const newEntryRef = push(chatRef);
  await set(newEntryRef, entry);
}

export function listenToChat(
  gameId: string,
  onNewEntry: (entry: ChatMessage) => void,
): () => void {
  const chatRef = ref(database, `games/${gameId}/chat`);
  onChildAdded(chatRef, (snapshot) => {
    const entry = snapshot.val();
    if (entry) onNewEntry(entry);
  });
  return () => off(chatRef);
}

//Fetches chat history in full from firebase
export async function fetchChatHistory(gameId: string): Promise<ChatMessage[]> {
  const chatRef = ref(database, `games/${gameId}/chat`);
  const snapshot = await get(chatRef);
  const data = snapshot.val();
  if (!data) return [];
  return Object.values(data) as ChatMessage[];
}

export async function getGameData(gameId: string): Promise<GameData | null> {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);
  return snapshot.val() as GameData | null;
}

export interface GameData {
  playerWhite: string | null;
  playerBlack: string | null;
  currentTurn: "white" | "black";
  fen: string;
  status: "waiting" | "ongoing" | "finished";
  lastMove: string | null;
  gameState: "ongoing" | "checkmate" | "stalemate" | "draw" | "forfeit";
  winner: "white" | "black" | null;
  updatedAt: number;
  timerSeconds: number;
  timerIncrement: number;
  draw: "draw_offer" | "draw_accept" | "draw_decline" | "forfeit" | null;
  drawBy?: Color | null;
}
