import type { Square, ChessBoard, Piece, PieceType } from "./chessTypes";
import {
  ChessPawn,
  ChessRook,
  ChessKnight,
  ChessBishop,
  ChessQueen,
  ChessKing,
} from "lucide-react";

type SquareProps = {
  square: Square;
};

//TODO: Check if sizing is fine for really small viewports, especially on mobile
export function SquareTSX({ square }: SquareProps) {
  return (
    <div
      className={`flex justify-center items-center select-none
        ${square.darkTile ? "bg-gray-800" : "bg-gray-500"}
        ${square.isTopLeft ? "rounded-tl" : ""}
        ${square.isTopRight ? "rounded-tr" : ""}
        ${square.isBottomLeft ? "rounded-bl" : ""}
        ${square.isBottomRight ? "rounded-br" : ""}`}
    >
      {square.squarePiece &&
        square.squarePiece.type === "pawn" &&
        square.squarePiece.color === "white" && (
          <ChessPawn
            size={21}
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "pawn" &&
        square.squarePiece.color === "black" && (
          <ChessPawn
            size={21}
            color="#000000"
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "rook" &&
        square.squarePiece.color === "white" && (
          <ChessRook
            size={21}
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "rook" &&
        square.squarePiece.color === "black" && (
          <ChessRook
            size={21}
            color="#000000"
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "knight" &&
        square.squarePiece.color === "white" && (
          <ChessKnight
            size={21}
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "knight" &&
        square.squarePiece.color === "black" && (
          <ChessKnight
            size={21}
            color="#000000"
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "bishop" &&
        square.squarePiece.color === "white" && (
          <ChessBishop
            size={21}
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "bishop" &&
        square.squarePiece.color === "black" && (
          <ChessBishop
            size={21}
            color="#000000"
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "queen" &&
        square.squarePiece.color === "white" && (
          <ChessQueen
            size={21}
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "queen" &&
        square.squarePiece.color === "black" && (
          <ChessQueen
            size={21}
            color="#000000"
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "king" &&
        square.squarePiece.color === "white" && (
          <ChessKing
            size={21}
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
      {square.squarePiece &&
        square.squarePiece.type === "king" &&
        square.squarePiece.color === "black" && (
          <ChessKing
            size={21}
            color="#000000"
            className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
        )}
    </div>
  );
}

type ChessBoardProps = {
  board: ChessBoard;
};

export function ChessBoardTSX({ board }: ChessBoardProps) {
  return (
    <div className="grid grid-cols-8 w-[80vw] md:w-[90vw] lg:w-[95v] max-w-170 aspect-square shadow-2xl">
      {board.flat().map((square) => (
        <SquareTSX key={`${square.row}-${square.col}`} square={square} />
      ))}
    </div>
  );
}

type pieceProps = {
  color: "white" | "black";
};

// export function pawnTSX

// Array.from({ length: 64 }).map((_, i) => {
//   //Convert 64 squares into 8x8 grid
//   const row = Math.floor(i / 8);
//   const col = i % 8;
//   //Files are columns in chess, going in order from A to H
//   //Ranks are rows going from 1 to 8
//   const file = files[col];
//   const rank = 8 - row;
//   //Black's POV:
//   //const file = files[7-col];
//   //const rank = row + 1;

//   const darkTile = (row + col) % 2 === 1;
//   const isTopLeft = row === 0 && col === 0 ? true : false;
//   const isTopRight = row === 0 && col === 7 ? true : false;
//   const isBottomLeft = row === 7 && col === 0 ? true : false;
//   const isBottomRight = row === 7 && col === 7 ? true : false;

//   return (
//     <div
//       key={i}
//       className={`flex justify-center items-center select-none
//         ${darkTile ? "bg-gray-800" : "bg-gray-500"}
//         ${isTopLeft ? "rounded-tl" : ""}
//         ${isTopRight ? "rounded-tr" : ""}
//         ${isBottomLeft ? "rounded-bl" : ""}
//         ${isBottomRight ? "rounded-br" : ""}`}
//     />
//   );
// });
