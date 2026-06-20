import { ref, set, onValue, update, off } from "firebase/database";
import { database } from "../../backend/firebase";
import { getAuth } from "firebase/auth";
import type { Color } from "./chessTypes";

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
  });
}

//Join an existing game
export async function joinGame(
  gameId: string,
  userId: string,
  playerColor: "white" | "black",
): Promise<boolean> {
  const gameRef = ref(database, `games/${gameId}`);

  return new Promise((resolve) => {
    onValue(
      gameRef,
      async (snapshot) => {
        off(gameRef); //Stop listening after first read
        const data = snapshot.val();

        if (!data) {
          console.error("Game not found");
          resolve(false);
          return;
        }
        if (data.status !== "waiting") {
          console.error("Game already in progress");
          resolve(false);
          return;
        }

        await update(gameRef, {
          playerWhite: playerColor === "white" ? userId : data.playerWhite,
          playerBlack: playerColor === "black" ? userId : data.playerBlack,
          status: "ongoing",
        });

        resolve(true);
      },
      { onlyOnce: true },
    );
  });
}

//Post move to Firebase
export async function postMove(
  gameId: string,
  fen: string,
  currentTurn: "white" | "black",
  lastMove: string,
  gameState: "ongoing" | "checkmate" | "stalemate" | "draw",
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

//Listen for changes to gamestate
export function listenToGame(
  gameId: string,
  callback: (data: GameData) => void,
): () => void {
  const gameRef = ref(database, `games/${gameId}`);

  const unsubscribe = onValue(gameRef, (snapshot) => {
    //Read fresh from snapshot
    const data = snapshot.val();
    // console.log("Firebase Data:", data);
    if (data) callback(data);
  });
  //onValue returns unsubscribe function directly
  return unsubscribe;
}

export function getCurrentUserID(): string {
  return getAuth().currentUser?.uid ?? "";
}

export interface GameData {
  playerWhite: string | null;
  playerBlack: string | null;
  currentTurn: "white" | "black";
  fen: string;
  status: "waiting" | "ongoing" | "finished";
  lastMove: string | null;
  gameState: "ongoing" | "checkmate" | "stalemate" | "draw";
  winner: "white" | "black" | null;
  updatedAt: number;
}
