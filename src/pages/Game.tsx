import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SquareTSX, ChessBoardTSX } from "../chess/Components";
import { createEmptyBoard, populateBoard } from "../chess/chessFunctions";

export default function ChessBoard() {
  const navigate = useNavigate();
  const initBoard = populateBoard(createEmptyBoard());
  const [board, setBoard] = useState(initBoard);

  return (
    <div className="min-h-screen bg-zinc-900 flex justify-center items-center p-4">
      <div className="absolute top-0 left-0 w-[1vw]">
        <button
          className="border bg-red-500 text-black"
          onClick={() => navigate("/")}
        >
          Return
        </button>
      </div>
      <div className="ml-60">
        <ChessBoardTSX board={board} />
      </div>
      <div className="ml-20 mr-20">Player's turn: Insert Here</div>
    </div>
  );
}
