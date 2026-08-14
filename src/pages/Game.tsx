import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChessBoardTSX } from "../chess/Components";
import { createEmptyBoard, populateBoard } from "../chess/chessFunctions";

export default function ChessBoard() {
  const navigate = useNavigate();
  const initBoard = populateBoard(createEmptyBoard());
  const [board] = useState(initBoard);

  //TODO: Reevaluate over game and see points, visibly display what material you and opponent have taken, sidebar with profile, mock elo rating and system, change return/back button
  //TODO: Redo button

  return (
    <div className="min-h-screen flex justify-center items-center p-4">
      <div className="fixed top-4 left-4 w-[2vw]">
        <button
          className="z-50 flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)\"
          onClick={() => navigate("/")}
        >
          Return
        </button>
      </div>
      <div>
        <ChessBoardTSX board={board} />
      </div>
    </div>
  );
}
