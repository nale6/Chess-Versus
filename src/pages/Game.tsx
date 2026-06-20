import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SquareTSX, ChessBoardTSX } from "../chess/Components";
import { createEmptyBoard, populateBoard } from "../chess/chessFunctions";

export default function ChessBoard() {
  const navigate = useNavigate();
  const initBoard = populateBoard(createEmptyBoard());
  const [board, setBoard] = useState(initBoard);

  //TODO: Chat, reevaluate over game and see points, visibly display what material you and opponent have taken, sidebar with profile, mock elo rating and system, change return/back button
  //TODO: Timer, redo button, bugfix pawn (investigate more)

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
      <div className="ml-70">
        <ChessBoardTSX board={board} />
      </div>

      {/* <div className="ml-50 p-6 scale-200 pt-70 pr-15 bg-gray-600">
        <div className="size-20 text-sm overflow-y-auto">Test</div>
      </div> */}
    </div>
  );
}
