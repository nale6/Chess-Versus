import type {
  Square,
  ChessBoard,
  Piece,
  PieceType,
  Move,
  Color,
} from "./chessTypes";
import {
  ChessPawn,
  ChessRook,
  ChessKnight,
  ChessBishop,
  ChessQueen,
  ChessKing,
  SquarePi,
} from "lucide-react";
import { useState } from "react";
import {
  autoRankUp,
  bishopMoves,
  check,
  checkMoves,
  filterLegalMoves,
  getMoves,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
  rookMoves,
  simulateMove,
  staleCheckMate,
} from "./pieceMoves";

type SquareProps = {
  square: Square;
  onClick: (square: Square) => void;
};

//TODO: Check if sizing is fine for really small viewports, especially on mobile
//TODO: Mirror for other player's pov (7 - row / col should work)
export function SquareTSX({ square, onClick }: SquareProps) {
  // const [board, setBoard] = useState<ChessBoard>();
  // square.selected = selected;

  return (
    <div
      onClick={() => {
        // selectClick(square);
        onClick(square);
      }}
      className={`flex justify-center items-center select-none
        ${square.darkTile ? "bg-gray-800" : "bg-gray-500 "}
        ${square.isTopLeft ? "rounded-tl" : ""}
        ${square.isTopRight ? "rounded-tr" : ""}
        ${square.isBottomLeft ? "rounded-bl" : ""}
        ${square.isBottomRight ? "rounded-br" : ""}
        ${square.selected ? "shadow-[inset_0_0_0_9999px_rgba(300,300,0)]/50" : ""}
        ${square.highlighted ? "shadow-[inset_0_0_0_9999px_rgba(0,125,0)]/50" : ""}`}
    >
      {/*REMINDER For highlighting legal moves, use "shadow-[inset_0_0_0_2px_green]" (Probably need to find brighter shade, or just use selected but green with bright green) */}
      {square.row === 0 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          8
        </div>
      )}
      {square.row === 1 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          7
        </div>
      )}
      {square.row === 2 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          6
        </div>
      )}
      {square.row === 3 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          5
        </div>
      )}
      {square.row === 4 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          4
        </div>
      )}
      {square.row === 5 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          3
        </div>
      )}
      {square.row === 6 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          2
        </div>
      )}
      {square.row === 7 && square.col === 0 && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          1
        </div>
      )}
      {square.row === 7 && square.col === 7 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          H
        </div>
      )}
      {square.row === 7 && square.col === 6 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          G
        </div>
      )}
      {square.row === 7 && square.col === 5 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          F
        </div>
      )}
      {square.row === 7 && square.col === 4 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          E
        </div>
      )}
      {square.row === 7 && square.col === 3 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          D
        </div>
      )}
      {square.row === 7 && square.col === 2 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          C
        </div>
      )}
      {square.row === 7 && square.col === 1 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          B
        </div>
      )}
      {square.row === 7 && square.col === 0 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          A
        </div>
      )}
      {square.squarePiece &&
        square.squarePiece.type === "pawn" &&
        square.squarePiece.color === "white" && (
          <div className="relative">
            <div
              className="absolute inset-0 inline-flex self-start w-fit h-fit items-center justify-center bg-transparent p-0 border-0 shadow-none"
              draggable
              onDragOver={(e) => e.preventDefault()}
            >
              <ChessPawn
                size={21}
                className="absolute w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              />
            </div>
          </div>
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
  const [click, setClicked] = useState(false);
  const [storePiece, setStorePiece] = useState<Piece | null>(null);
  const [prevSquare, setPrevSquare] = useState<Square | null>(null);
  const [playerTurn, setPlayerTurn] = useState<Color>("white");
  const [legalMove, setLegalMove] = useState<Move[]>([]);
  const [highlightedSquare, setHighlightedSquares] = useState<Square[]>([]);
  const [inCheck, setInCheck] = useState(false);
  const [checkingMoves, setCheckingMoves] = useState<Move[]>([]);
  // ^^^ Not really using last 4 but keeping them for now, might use later for readability or to send and receive from chess APIs or convert to FEN format etc
  function getLegalMoves(square: Square): Move[] {
    let moves: Move[] = [];
    if (square && square.squarePiece!.type === "pawn") {
      moves = pawnMoves(square.squarePiece!, square, board);
    }
    if (square && square.squarePiece!.type === "rook") {
      moves = rookMoves(square.squarePiece!, square, board);
    }
    if (square && square.squarePiece!.type === "bishop") {
      moves = bishopMoves(square.squarePiece!, square, board);
    }
    if (square && square.squarePiece!.type === "queen") {
      moves = queenMoves(square.squarePiece!, square, board);
    }
    if (square && square.squarePiece!.type === "king") {
      moves = kingMoves(square.squarePiece!, square, board);
      let enemyMovement = getMoves(square.squarePiece!.color, board);
      let legalMoves = filterLegalMoves(enemyMovement, moves);
      //TODO condense lower part/make it readable
      let blackwhite: Color = "black";
      if (square.squarePiece?.color === "black") blackwhite = "white";
      let myMoves = getMoves(blackwhite, board);
      let filteredMyMoves = filterLegalMoves(enemyMovement, myMoves);
      if (filteredMyMoves.length === 0) {
        staleCheckMate(square.squarePiece!.color, board);
      }
      return legalMoves;
    }
    if (square && square.squarePiece!.type === "knight") {
      moves = knightMoves(square.squarePiece!, square, board);
    }
    return moves;
  }

  function highlightLegalMoves(moves: Move[]): void {
    moves.forEach((move) => {
      let square = board
        .flat()
        .find((square) => square.row === move.row && square.col === move.col);
      square!.highlighted = true;
      setHighlightedSquares((prev) => [...prev, square!]);
      // console.log("Found move: ", square);
    });
    // console.log("highlighted");
  }

  function unHighlight(): void {
    setHighlightedSquares([]);
    let squares = board.flat();
    squares.forEach((square) => {
      square.highlighted = false;
    });
  }

  function unSelect(): void {
    let squares = board.flat();
    squares.forEach((square) => {
      square.selected = false;
    });
  }

  function onlyMoveOnTurn(square: Square): void {
    if (square.squarePiece?.color !== playerTurn) {
      setClicked(false);
      square.highlighted = false;
      unHighlight();
      unSelect();
      console.log("Not their turn");
    }
  }

  function onSuccessfulMove(): void {
    if (playerTurn === "white") {
      setPlayerTurn("black");
    } else if (playerTurn === "black") {
      setPlayerTurn("white");
    }
    autoRankUp(playerTurn, board);
  }

  function parentClick(square: Square): void {
    handleClick(square);
    onlyMoveOnTurn(square);
    //TODO need to get the moves checking the opponent
    setInCheck(check(playerTurn, board));
  }

  //TODO: Only move on legal moves / selected squares as legal moves
  function handleClick(square: Square): void {
    const playerIsInCheck = check(playerTurn, board);
    //Initial click on empty square
    if (!click && !square.squarePiece) {
      setStorePiece(null);
      setPrevSquare(null);
      setClicked(false);
      unHighlight();
    }
    //Already clicked -> clicking on a square with a piece
    else if (click && square.squarePiece) {
      //grab legal moves function here
      if (prevSquare) {
        //If clicking on square with different color piece
        if (prevSquare.squarePiece?.color !== square.squarePiece.color) {
          if (square.highlighted === true && !playerIsInCheck) {
            const inCheckAfterMove = simulateMove(
              prevSquare,
              board,
              square,
              playerTurn,
            );
            if (inCheckAfterMove) {
              setPrevSquare(null);
              setStorePiece(null);
              prevSquare.selected = false;
              setClicked(false);
              unHighlight();
              return;
            }
            square.squarePiece = storePiece;
            prevSquare.selected = false;
            setClicked(false);
            unHighlight();
            if (prevSquare.squarePiece!.moved === false) {
              prevSquare.squarePiece!.moved = true;
            }
            prevSquare.squarePiece = null;
            onSuccessfulMove();
          }
          //If in check, simulate move, if still in check, unhighlight and don't use move, else use move
          else if (square.highlighted === true && playerIsInCheck) {
            const stillInCheck = simulateMove(
              prevSquare,
              board,
              square,
              playerTurn,
            );
            if (stillInCheck) {
              prevSquare.selected = false;
              setStorePiece(null);
              setPrevSquare(null);
              setClicked(false);
              unHighlight();
              return;
            } else {
              setInCheck(false);
              setClicked(false);
              square.squarePiece = storePiece;
              prevSquare!.squarePiece = null;
              prevSquare!.selected = false;
              setPrevSquare(null);
              setStorePiece(null);
              unHighlight();
              onSuccessfulMove();
            }
          } else {
            prevSquare.selected = false;
            setStorePiece(null);
            setPrevSquare(null);
            setClicked(false);
            unHighlight();
          }
        }
        //If clicking on same square
        else if (prevSquare === square) {
          prevSquare.selected = false;
          setStorePiece(null);
          setPrevSquare(null);
          setClicked(false);
          unHighlight();
        }
        //Other cases are clicking on non-same square with same color piece
        else {
          prevSquare.selected = false;
          setStorePiece(square.squarePiece);
          setPrevSquare(square);
          unHighlight();
          highlightLegalMoves(getLegalMoves(square));
          square.selected = true;
        }
      }
    }
    //Initial click -> Click on square with piece
    else if (square.squarePiece && !click) {
      setClicked(true);
      setPrevSquare(square);
      setStorePiece(square.squarePiece);
      square.selected = true;
      highlightLegalMoves(getLegalMoves(square));
    }
    //Already clicked -> Click on square with no piece
    else if (!square.squarePiece && click && storePiece !== null) {
      //grab legal moves function here
      //vvv Discovered check, if after user's move the king gets put in check, they can't perform this move
      const inCheckAfterMove = simulateMove(
        prevSquare!,
        board,
        square,
        playerTurn,
      );
      if (square.highlighted && storePiece !== null && !playerIsInCheck) {
        //Discovered check
        if (inCheckAfterMove) {
          setPrevSquare(null);
          setStorePiece(null);
          prevSquare!.selected = false;
          setClicked(false);
          unHighlight();
          return;
        }
        if (!square.squarePiece) {
          square.squarePiece = storePiece;
          setClicked(false);
          if (prevSquare?.squarePiece!.moved === false) {
            prevSquare!.squarePiece!.moved = true;
          }
          if (prevSquare !== null) {
            prevSquare.squarePiece = null;
            prevSquare.selected = false;
            setStorePiece(null);
          }
          onSuccessfulMove();
        }
      }
      //Same thing, if it's in check, unhighlight all and forget move, else continue with move
      //BUG: Causing infinite recursion, find solution. Otherwise the check and simulation move does work, just repeatedly calling handleclick because setInCheck is not immediately updating inCheck, just scheduling it, so it's not being updated.
      else if (square.highlighted && storePiece !== null && playerIsInCheck) {
        setInCheck(simulateMove(prevSquare!, board, square, playerTurn));
        const stillInCheck = simulateMove(
          prevSquare!,
          board,
          square,
          playerTurn,
        );
        if (stillInCheck) {
          prevSquare!.selected = false;
          setStorePiece(null);
          setClicked(false);
          unHighlight();
          console.log("This is happening");
          return;
        } else {
          setInCheck(false);
          setClicked(false);
          square.squarePiece = storePiece;
          prevSquare!.squarePiece = null;
          prevSquare!.selected = false;
          setPrevSquare(null);
          setStorePiece(null);
          unHighlight();
          onSuccessfulMove();
        }
      } else {
        prevSquare!.selected = false;
        setStorePiece(null);
        setPrevSquare(null);
        setClicked(false);
        unHighlight();
      }
      unHighlight();
    }
  }

  return (
    <div className="grid grid-cols-8 w-[80vw] md:w-[90vw] lg:w-[95v] max-w-170 aspect-square shadow-2xl">
      {board.flat().map((square) => (
        <SquareTSX
          key={`${square.row}-${square.col}`}
          onClick={parentClick}
          square={square}
        />
      ))}
    </div>
  );
}

// type pieceProps = {
//   color: "white" | "black";
// };

// export function pawnTSX

// TODO finish function for moving pieces. Also need to do valid/legal moves with certain rules such as castling.
