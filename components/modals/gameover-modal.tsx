import {
  Scale,
  Crown,
  Handshake,
  type LucideIcon,
  Timer,
  Flag,
} from "lucide-react";
import type { Color } from "../../src/chess/chessTypes";

export type GameState =
  | "ongoing"
  | "closed"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "timeout"
  | "forfeit";

interface GameOverModalProps {
  gameState: GameState;
  winner?: Color; // pass the winner's color when it's checkmate
  onRematch: () => void;
  onClose: () => void;
}

const gameOverIcon: Record<
  Exclude<GameState, "ongoing" | "closed">,
  LucideIcon
> = {
  checkmate: Crown,
  stalemate: Scale,
  draw: Handshake,
  timeout: Timer,
  forfeit: Flag,
};

export function GameOverModal({
  gameState,
  winner,
  onRematch,
  onClose,
}: GameOverModalProps) {
  if (gameState === "ongoing" || gameState === "closed") return null;

  //Pops up who won or if it was draw/stalemate
  const content: Record<
    Exclude<GameState, "ongoing" | "closed">,
    { heading: string; subtext?: string }
  > = {
    checkmate: {
      heading: "Checkmate",
      subtext: `${winner === "white" ? "White" : "Black"} wins!`,
    },
    stalemate: {
      heading: "Stalemate",
    },
    draw: {
      heading: "Draw",
    },
    timeout: {
      heading: "Timeout",
      subtext: `${winner === "white" ? "White" : "Black"} wins!`,
    },
    forfeit: {
      heading: "Forfeit",
      subtext: `${winner === "white" ? "White" : "Black"} wins by forfeit.`,
    },
  };

  const Icon = gameOverIcon[gameState];

  const { heading, subtext } = content[gameState];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-6 rounded-2xl bg-zinc-900 border border-gray-700 px-10 py-10 shadow-2xl w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon size={48} className="text-white mb-[-7%]" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {heading}
          </h2>
          <p className="text-sm text-gray-400">{subtext}</p>
        </div>

        <div className="w-full h-px bg-gray-700" />

        <div className="flex w-full gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer select-none"
          >
            Close
          </button>
          <button
            onClick={onRematch}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-gray-200 transition-colors cursor-pointer select-none"
          >
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
}
