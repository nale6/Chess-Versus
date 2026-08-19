import { useEffect, useRef, useState } from "react";
import type { Color } from "./chessTypes";
import type { GameConfig } from "../../components/modals/gamemode-modal";
import {
  createGame,
  generateGameID,
  getCurrentUserID,
  getGameData,
  joinGame,
  listenToGame,
} from "./multiplayer";

export interface GameReadyInfo {
  config: GameConfig;
  gameID: string;
}

export function useGameSetup(
  onReady: (info: GameReadyInfo) => void,
) {
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  });

  async function handleCreateGame(
    playerColor: Color,
    timerSeconds: number,
    timerIncrement: number,
    timerEnabled: boolean,
  ): Promise<void> {
    const gameId = generateGameID();

    await createGame(
      gameId,
      getCurrentUserID(),
      playerColor,
      timerSeconds,
      timerIncrement,
      timerEnabled,
    );
    setGameCode(gameId);
    setWaitingForOpponent(true);

    const unsub = listenToGame(gameId, (data) => {
      if (data.status === "ongoing") {
        setWaitingForOpponent(false);
        unsub();
        unsubscribeRef.current = null;
        onReadyRef.current({
          config: {
            mode: "multiplayer",
            playerColor,
            timerSeconds,
            timerIncrement,
            timerEnabled,
          },
          gameID: gameId,
        });
      }
    });
    unsubscribeRef.current = unsub;
  }

  async function handleJoinGame(
    gameId: string,
    _playerColor: Color,
  ): Promise<void> {
    const result = await joinGame(gameId, getCurrentUserID());
    if (!result.success || !result.assignedColor) {
      console.error("Failed to join game");
      return;
    }

    const gameData = await getGameData(gameId);
    onReadyRef.current({
      config: {
        mode: "multiplayer",
        playerColor: result.assignedColor,
        timerSeconds: gameData?.timerSeconds ?? 300,
        timerIncrement: gameData?.timerIncrement ?? 0,
        timerEnabled: gameData?.timerEnabled ?? true,
      },
      gameID: gameId,
    });
  }

  useEffect(() => {
    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, []);

  return { gameCode, waitingForOpponent, handleCreateGame, handleJoinGame };
}