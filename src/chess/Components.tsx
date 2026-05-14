import type { Square, ChessBoard, Piece, PieceType } from "./chessTypes";
import {
  ChessPawn,
  ChessRook,
  ChessKnight,
  ChessBishop,
  ChessQueen,
  ChessKing,
} from "lucide-react";
import { useState } from "react";

type SquareProps = {
  square: Square;
};

//TODO: Check if sizing is fine for really small viewports, especially on mobile
//TODO: Mirror for other player's pov (7 - row / col should work)
export function SquareTSX({ square }: SquareProps) {
  const [selected, setSelected] = useState(false);
  square.selected = selected;

  function handleClick(square: Square): void {
    if (square.selected === false) {
      square.selected = true;
      setSelected(true);
    } else {
      square.selected = false;
      setSelected(false);
    }
  }

  return (
    <div
      onClick={() => {
        handleClick(square);
      }}
      className={`flex justify-center items-center select-none
        ${square.darkTile ? "bg-gray-800" : "bg-gray-500 "}
        ${square.isTopLeft ? "rounded-tl" : ""}
        ${square.isTopRight ? "rounded-tr" : ""}
        ${square.isBottomLeft ? "rounded-bl" : ""}
        ${square.isBottomRight ? "rounded-br" : ""}
        ${square.selected ? "shadow-[inset_0_0_0_9999px_rgba(500,500,0)]/50" : ""}`}
    >
      {/*REMINDER For highlighting legal moves, use "shadow-[inset_0_0_0_2px_green]" (Probably need to find brighter shade, or just use selected but green with bright green) */}
      {square.row === 0 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          8
        </div>
      )}
      {square.row === 1 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          7
        </div>
      )}
      {square.row === 2 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          6
        </div>
      )}
      {square.row === 3 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          5
        </div>
      )}
      {square.row === 4 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          4
        </div>
      )}
      {square.row === 5 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          3
        </div>
      )}
      {square.row === 6 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          2
        </div>
      )}
      {square.row === 7 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          1
        </div>
      )}
      {square.row === 7 && square.col === 7 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          H
        </div>
      )}
      {square.row === 7 && square.col === 6 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          G
        </div>
      )}
      {square.row === 7 && square.col === 5 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          F
        </div>
      )}
      {square.row === 7 && square.col === 4 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          E
        </div>
      )}
      {square.row === 7 && square.col === 3 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          D
        </div>
      )}
      {square.row === 7 && square.col === 2 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          C
        </div>
      )}
      {square.row === 7 && square.col === 1 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          B
        </div>
      )}
      {square.row === 7 && square.col === 0 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
          A
        </div>
      )}
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

// type pieceProps = {
//   color: "white" | "black";
// };

// export function pawnTSX

//TODO finish function for moving pieces. Also need to do valid/legal moves with certain rules such as castling.
// const [click, setClicked] = useState(false);
// const [storePiece, setStorePiece] = useState("");
// const [board, setBoard] = useState();

// export function handleclick(
//   piece: Piece,
//   square: Square,
//   chessboard: ChessBoard,
// ): void {
//   if (!click && !piece) {
//     setStorePiece("");
//     return;
//   }

//   if (click && piece) {
//     setClicked(false);
//     setStorePiece("");
//   }

//   if (piece && !click) {
//     setClicked(true);
//     setStorePiece(square.squarePiece.type);
//   }

//   if (!piece && click) {
//   }
// }
