import { useState } from "react";
import type { Color } from "../../src/chess/chessTypes";

interface GameSetupModalProps {
  onStart: (config: GameConfig) => void;
}

export interface GameConfig {
  mode: "ai" | "multiplayer" | "local";
  playerColor?: Color; // Important even in local for mirroring shenanigans
  difficulty?: number; // only matters on vs ai
}

export function GameSetupModal({ onStart }: GameSetupModalProps) {
  const [mode, setMode] = useState<"ai" | "multiplayer" | "local">("local");
  const [playerColor, setPlayerColor] = useState<Color>("white");
  const [difficulty, setDifficulty] = useState(5);

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
          <p className="text-sm text-gray-400 text-center">TODO</p>
        )}
        <button
          onClick={() => onStart({ mode, playerColor, difficulty })}
          disabled={mode === "multiplayer"}
          className="w-full rounded-lg bg-white py-2.5 text-sm font-medium text-zinc-900 hover:bg-gray-200 cursor-pointer select-none disabled:cursor-not-allowed"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
