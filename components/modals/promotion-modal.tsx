import { ChessBishop, ChessKnight, ChessQueen, ChessRook } from "lucide-react";
import type { Color } from "../../src/chess/chessTypes";
import type { PromotionType } from "../../src/chess/chessFunctions";

interface PromotionModalProps {
  color: Color;
  onSelect: (type: PromotionType) => void;
}

const options: {
  type: PromotionType;
  label: string;
  Icon: typeof ChessQueen;
}[] = [
  { type: "queen", label: "Queen", Icon: ChessQueen },
  { type: "rook", label: "Rook", Icon: ChessRook },
  { type: "bishop", label: "Bishop", Icon: ChessBishop },
  { type: "knight", label: "Knight", Icon: ChessKnight },
];

export function PromotionModal({ color, onSelect }: PromotionModalProps) {
  const isWhite = color === "white";
  const pieceColor = isWhite ? "#ffffff" : "#000000";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ">
      <div className="flex flex-col gap-6 rounded-2xl bg-zinc-900 border border-gray-700 px-10 py-8 shadow-2xl w-[95%] sm:w-full max-w-sm mx-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-xl font-semibold text-white select-none">
            Promote Pawn
          </h2>
          <p className="text-sm text-gray-400 select-none">
            Choose a piece to upgrade to
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {options.map(({ type, label, Icon }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="flex flex-col items-center gap-2 rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 hover:bg-gray-700 hover:border-gray-500 transition-colors cursor-pointer select-none"
            >
              <Icon size={40} color={pieceColor} />
              <span className="text-xs text-gray-300">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
