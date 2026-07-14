import { useState } from "react";
import type { Color } from "../../src/chess/chessTypes";

interface GameSetupModalProps {
  onStart: (config: GameConfig) => void;
  onCreateGame: (
    playerColor: Color,
    timerSeconds: number,
    timerIncrement: number,
  ) => Promise<void>;
  onJoinGame: (gameId: string, playerColor: "white" | "black") => Promise<void>;
  gameCode: string | null;
  waitingForOpponent: boolean;
}

export interface GameConfig {
  mode: "ai" | "multiplayer" | "local";
  playerColor?: Color; // Important even in local for mirroring shenanigans
  difficulty?: number; // only matters on vs ai
  timerSeconds: number;
  timerIncrement: number; // 0 = disabled
}

export function GameSetupModal({
  onStart,
  onCreateGame,
  onJoinGame,
  gameCode,
  waitingForOpponent,
}: GameSetupModalProps) {
  const [mode, setMode] = useState<"ai" | "multiplayer" | "local">("local");
  const [playerColor, setPlayerColor] = useState<Color>("white");
  const [difficulty, setDifficulty] = useState(5);
  const [joinCode, setJoinCode] = useState("");
  const [onlineColor, setOnlineColor] = useState<"white" | "black">("white");

  const timeOptions = [
    { label: "30s", value: 30 },
    { label: "1m", value: 60 },
    { label: "2m", value: 120 },
    { label: "3m", value: 180 },
    { label: "5m", value: 300 },
    { label: "10m", value: 600 },
    { label: "15m", value: 900 },
    { label: "20m", value: 1200 },
    { label: "30m", value: 1800 },
  ];
  const [timerIndex, setTimerIndex] = useState(4);
  const [incrementEnabled, setIncrementEnabled] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col gap-6 rounded-2xl bg-zinc-900 border border-gray-700 px-10 py-10 shadow-2xl w-full max-w-sm mx-4">
        <h2 className="text-xl font-semibold text-white text-center select-none">
          New Game
        </h2>

        {/*Mode selection*/}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider">
            Mode
          </label>
          <div className="flex gap-2">
            {(["local", "ai", "multiplayer"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer select-none
                  ${
                    mode === m
                      ? "bg-white text-zinc-900"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {m === "local" ? "Local" : m === "ai" ? "VS AI" : "Online"}
              </button>
            ))}
          </div>
        </div>

        {/**Local Tab */}
        {mode === "local" && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">
                Point Of View
              </label>
              <div className="flex gap-2 mb-[5%]">
                {(["white", "black"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setPlayerColor(c)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer select-none
                      ${
                        playerColor === c
                          ? "bg-white text-zinc-900"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    {c === "white" ? "White" : "Black"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/*VS AI Tab */}
        {mode === "ai" && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">
                Play as
              </label>
              <div className="flex gap-2">
                {(["white", "black"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setPlayerColor(c)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer select-none
                      ${
                        playerColor === c
                          ? "bg-white text-zinc-900"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    {c === "white" ? "White" : "Black"}
                  </button>
                ))}
              </div>
            </div>

            {/*Difficulty Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  Difficulty
                </label>
                <span className="text-xs text-gray-400">
                  {difficulty <= 3
                    ? "Beginner"
                    : difficulty <= 5
                      ? "Intermediate"
                      : difficulty <= 7
                        ? "Advanced"
                        : "Expert"}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={9}
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full accent-white cursor-grab active:cursor-grabbing select-none"
              />
              <div className="flex justify-between text-xs text-gray-600">
                {/* 1-10 Even though it's 1-9 because it looks better. 1-9 because the 5 is in exact middle. */}
                <span>1</span>
                <span>10</span>
              </div>
            </div>
          </>
        )}
        {mode === "multiplayer" && (
          <div className="flex flex-col gap-4">
            {/* Player selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">
                Play as
              </label>
              <div className="flex gap-2">
                {(["white", "black"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setOnlineColor(c)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors
              ${
                onlineColor === c
                  ? "bg-white text-zinc-900"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
                  >
                    {c === "white" ? "White" : "Black"}
                  </button>
                ))}
              </div>
            </div>

            {/*Waiting Screen */}
            {waitingForOpponent ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-gray-400">
                  Share this code with your opponent:
                </p>
                <p className="text-3xl font-mono font-bold text-white tracking-widest">
                  {gameCode}
                </p>
                <p className="text-xs text-gray-500 animate-pulse">
                  Waiting for opponent to join...
                </p>
              </div>
            ) : (
              //Create or join game
              <div className="flex flex-col gap-3">
                <button
                  onClick={() =>
                    onCreateGame(
                      onlineColor,
                      timeOptions[timerIndex].value,
                      incrementEnabled ? 1 : 0,
                    )
                  }
                  className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-zinc-900 hover:bg-gray-200 transition-colors"
                >
                  Create Game
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-700" />
                  <span className="text-xs text-gray-500">or</span>
                  <div className="flex-1 h-px bg-gray-700" />
                </div>
                <div className="flex gap-2">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    maxLength={6}
                    className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 font-mono tracking-widest outline-none border border-gray-700 focus:border-gray-500"
                  />
                  <button
                    onClick={() => onJoinGame(joinCode, onlineColor)}
                    disabled={joinCode.length !== 6}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-gray-200 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Join
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timer selection */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-400 uppercase tracking-wider">
              Time per player
            </label>
            <span className="text-xs text-white font-medium">
              {timeOptions[timerIndex].label}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={timeOptions.length - 1}
            value={timerIndex}
            onChange={(e) => setTimerIndex(Number(e.target.value))}
            className="w-full accent-white"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>30s</span>
            <span>30m</span>
          </div>
        </div>

        {/* Increment toggle */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              +1s per move
            </span>
            <span className="text-xs text-gray-600">
              Add 1 second after each move
            </span>
          </div>
          <button
            onClick={() => setIncrementEnabled((prev) => !prev)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200
      ${incrementEnabled ? "bg-white" : "bg-gray-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-zinc-900 transition-transform duration-200
        ${incrementEnabled ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
        <button
          onClick={() =>
            onStart({
              mode,
              playerColor,
              difficulty,
              timerSeconds: timeOptions[timerIndex].value,
              timerIncrement: incrementEnabled ? 1 : 0,
            })
          }
          disabled={mode === "multiplayer"}
          className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-zinc-900 hover:bg-gray-200 cursor-pointer select-none disabled:invisible disabled:mb-[-20%]"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
