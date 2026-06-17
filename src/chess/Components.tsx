import type { Square, ChessBoard, Piece, Move, Color } from "./chessTypes";
import type { GameState } from "../../components/modals/gameover-modal";
import {
  ChessPawn,
  ChessRook,
  ChessKnight,
  ChessBishop,
  ChessQueen,
  ChessKing,
} from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  autoRankUp,
  bishopMoves,
  check,
  filterLegalMoves,
  getEnemyMoves,
  getGameState,
  getMoves,
  isFiftyMoveDraw,
  isThreeRepetitionDraw,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
  rookMoves,
  simulateMove,
  staleCheckMate,
} from "./pieceMoves";
import {
  completeFEN,
  coordinates,
  fenFormat,
  populateBoard,
} from "./chessFunctions";
import { GameOverModal } from "../../components/modals/gameover-modal";
import { difficultyToDepth, getStockfishMove, uciToSquare } from "./stockFish";
import {
  GameSetupModal,
  type GameConfig,
} from "../../components/modals/gamemode-modal";

type SquareProps = {
  square: Square;
  onClick: (square: Square) => void;
  playerColor: Color;
};

//TODO: Check if sizing is fine for really small viewports, especially on mobile
//TODO: Mirror for other player's pov (7 - row / col should work)
export function SquareTSX({ square, onClick, playerColor }: SquareProps) {
  const files =
    playerColor === "black"
      ? ["H", "G", "F", "E", "D", "C", "B", "A"]
      : ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div
      onClick={() => {
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
      {square.row === 7 && playerColor !== "black" && square.col === 7 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          H
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 6 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          G
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 5 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          F
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 4 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          E
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 3 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          D
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 2 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          C
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 1 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          B
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 0 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          A
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 7 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          H
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 6 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          G
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 5 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          F
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 4 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          E
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 3 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          D
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 2 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          C
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 1 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          B
        </div>
      )}
      {square.row === 7 && playerColor !== "black" && square.col === 0 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mb-[-15%] lg:mb-[-13%] xl:mb-[-10%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          A
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 7 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          A
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 6 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          B
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 5 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          C
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 4 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          D
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 3 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          E
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 2 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          F
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 1 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          G
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 0 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          H
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
  const [highlightedSquare, setHighlightedSquares] = useState<Square[]>([]);
  const [gameState, setGameState] = useState<GameState>("ongoing");
  const [winner, setWinner] = useState<Color | undefined>(undefined);
  const showGameOverModal = gameState !== "ongoing";
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [, forceRender] = useReducer((x) => x + 1, 0);
  const currentTurnRef = useRef<Color>("white");
  const turnRef = useRef(1);
  const halfRef = useRef(0);
  const checkRef = useRef(false);
  const fenRef = useRef<string[]>([]);
  const playerRef = useRef<Color>("white");
  const vsAIRef = useRef<boolean>(false);
  const colorAIRef = useRef<Color | undefined>(undefined);
  const aiResponseWaitRef = useRef<boolean>(false);
  const firstMoveRef = useRef<boolean>(true);
  const enPassantRef = useRef<string[]>([]);
  const enPassantHistoryRef = useRef<string[]>([]);

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
      const playerColor = square.squarePiece!.color;
      const playerMovement = getMoves(playerColor, board);
      const enemyMovement = getEnemyMoves(playerColor, board);
      console.log(enemyMovement);
      const legalMoves = filterLegalMoves(enemyMovement, moves);
      const filteredMyMoves = filterLegalMoves(enemyMovement, playerMovement);
      if (filteredMyMoves.length === 0) {
        staleCheckMate(playerColor, board);
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
      if (move.castle) {
        square!.castle = move.castle;
        square!.castleDir = move.castleDir;
      }
      if (move.enPassant) {
        square!.enPassant = move.enPassant;
        let direction = currentTurnRef.current === "white" ? 1 : -1;
        board[square!.row + direction][square!.col].enPassantTake = true;
      }
    });
  }

  function castling(board: ChessBoard, player: Color, direction: string): void {
    let x = 7;
    if (player === "black") x = 0;
    let dir = 0;
    let move = 2;
    if (direction === "right") {
      dir = 7;
      move = 5;
    }
    let sqr = board[x][dir].squarePiece;
    board[x][move].squarePiece = sqr;
    board[x][dir].squarePiece = null;
  }

  function enPassant(board: ChessBoard, square: Square, player: Color): void {
    let dir = 1;
    if (player === "black") dir = -1;
    board[square.row + dir][square.col].squarePiece = null;
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
    if (square.squarePiece?.color !== currentTurnRef.current) {
      setClicked(false);
      square.highlighted = false;
      unHighlight();
      unSelect();
      // console.log("Not their turn");
    }
  }

  //Function that grabs latest unique en passant square
  function latestEnPassant(
    board: ChessBoard,
    enPassantRef: string[],
    enPassantHistoryRef: string[],
  ): string | undefined {
    let latest = false;
    if (enPassantRef.length > 0) {
      enPassantRef.forEach((_) => {
        enPassantRef.pop();
      });
    }
    const add: string[] = [];

    if (enPassantHistoryRef.length === 0) {
      board.flat().forEach((sqr) => {
        if (sqr.enPassantTake) {
          add.push(sqr.coordinate);
          latest = true;
        }
      });
      enPassantHistoryRef.push(add[0]);
      return add[0];
    }

    board.flat().forEach((sqr) => {
      if (sqr.enPassantTake) {
        const seen = enPassantHistoryRef.some((ref) => ref === sqr.coordinate);
        if (!seen) {
          add.push(sqr.coordinate);
          latest = true;
        }
      }
    });
    if (latest === false) {
      return undefined;
    }
    enPassantHistoryRef.push(add[0]);
    enPassantRef.push(add[0]);
    return enPassantRef[0];
  }

  function onSuccessfulMove(): void {
    autoRankUp(currentTurnRef.current, board);
    const enPassant = latestEnPassant(
      board,
      enPassantRef.current,
      enPassantHistoryRef.current,
    );
    const nextPlayer = currentTurnRef.current === "white" ? "black" : "white";
    currentTurnRef.current = nextPlayer;
    const color = currentTurnRef.current === "white" ? "b" : "w";
    removeCastle();
    turnRef.current++;
    // console.log(
    //   completeFEN(
    //     board,
    //     fenFormat(board),
    //     color,
    //     halfRef.current,
    //     turnRef.current,
    //   ),
    // );
    // if (enPassantRef.current !== undefined) {
    //   console.log(enPassantRef.current);
    // }
    fenRef.current.push(
      completeFEN(
        board,
        fenFormat(board),
        color,
        halfRef.current,
        turnRef.current,
        enPassant,
      ),
    );
    //Logs complete FEN. FENCHECK
    // console.log(
    //   completeFEN(
    //     board,
    //     fenFormat(board),
    //     color,
    //     halfRef.current,
    //     turnRef.current,
    //     enPassant,
    //   ),
    // );
    const state = getGameState(nextPlayer, board);
    //TODO: End of game handler vvv
    if (state === "checkmate") {
      // console.log(`Checkmate, ${currentTurnRef.current} wins.`);
      setWinner(currentTurnRef.current);
      setGameState("checkmate");
    } else if (state === "stalemate") {
      // console.log("Draw by stalemate.");
      setGameState("stalemate");
    } else if (isFiftyMoveDraw(halfRef.current)) {
      // console.log("Draw by 50 move rule.");
      setGameState("draw");
    } else if (isThreeRepetitionDraw(fenRef.current)) {
      // console.log("Draw by repetition.");
      setGameState("draw");
    }
    if (vsAIRef.current && nextPlayer === colorAIRef.current) {
      handleAiMove(colorAIRef.current);
    }
    if (firstMoveRef.current === true) {
      firstMoveRef.current = false;
    }
  }

  //Goes through board and changes castle flag
  function removeCastle(): void {
    let squares = board.flat();
    squares.forEach((square) => {
      square.castle = false;
      square.castleDir = "";
    });
  }

  //Goes through board and changes en passant flag
  function removeEnPassant(): void {
    let squares = board.flat();
    squares.forEach((square) => {
      square.enPassant = false;
      square.enPassantTake = false;
    });
  }

  function parentClick(square: Square): void {
    handleClick(square);
    onlyMoveOnTurn(square);
    checkRef.current = check(currentTurnRef.current, board);
  }

  //TODO: Proper highlighting. Still buggy in what it shows, mostly an issue due to inconsistency
  function handleClick(square: Square): void {
    //TODO: Remove debugs
    // console.log("handleClick fired, currentTurn:", currentTurnRef.current);
    const playerIsInCheck = check(currentTurnRef.current, board);
    //Initial click on empty square
    if (!click && !square.squarePiece) {
      // console.log("Clicked on empty square with no clicks beforehand");
      setStorePiece(null);
      setPrevSquare(null);
      setClicked(false);
      unHighlight();
    }
    //Already clicked -> clicking on a square with a piece
    else if (click && square.squarePiece) {
      // console.log("Clicked on piece while already having clicked");
      //grab legal moves function here
      if (prevSquare) {
        //If clicking on square with different color piece
        if (prevSquare.squarePiece?.color !== square.squarePiece.color) {
          if (square.highlighted === true && !playerIsInCheck) {
            const inCheckAfterMove = simulateMove(
              prevSquare,
              board,
              square,
              currentTurnRef.current,
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
            halfRef.current = 0;
            fenRef.current = [];
            onSuccessfulMove();
          }
          //If in check, simulate move, if still in check, unhighlight and don't use move, else use move
          else if (square.highlighted === true && playerIsInCheck) {
            const stillInCheck = simulateMove(
              prevSquare,
              board,
              square,
              currentTurnRef.current,
            );
            if (stillInCheck) {
              prevSquare.selected = false;
              setStorePiece(null);
              setPrevSquare(null);
              setClicked(false);
              unHighlight();
              return;
            } else {
              checkRef.current = false;
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
      // console.log("Initial click on square with piece");
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
        currentTurnRef.current,
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
          if (square.castle) {
            castling(board, currentTurnRef.current, square.castleDir!);
          }
          if (square.enPassantTake && storePiece.type === "pawn") {
            enPassant(board, square, currentTurnRef.current);
            removeEnPassant();
            // console.log("happened");
          }
          // console.log(square.enPassant);
          if (storePiece?.type === "pawn") {
            halfRef.current = 0;
          } else {
            halfRef.current++;
          }
          onSuccessfulMove();
        }
      }
      //Same thing, if it's in check, unhighlight all and forget move, else continue with move
      else if (square.highlighted && storePiece !== null && playerIsInCheck) {
        checkRef.current = simulateMove(
          prevSquare!,
          board,
          square,
          currentTurnRef.current,
        );
        const stillInCheck = simulateMove(
          prevSquare!,
          board,
          square,
          currentTurnRef.current,
        );
        if (stillInCheck) {
          prevSquare!.selected = false;
          setStorePiece(null);
          setClicked(false);
          unHighlight();
          return;
        } else {
          if (square.castle) {
            castling(board, currentTurnRef.current, square.castleDir!);
          }
          if (storePiece.type === "pawn") {
            halfRef.current = 0;
          } else {
            halfRef.current++;
          }
          checkRef.current = false;
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

  //Sets game to be in playable state and restarts game config modal
  function handleRematch(): void {
    setGameState("ongoing");
    setGameConfig(null);
  }

  async function handleAiMove(color: Color): Promise<void> {
    // console.log(
    //   "handleAiMove called:",
    //   aiResponseWaitRef.current,
    //   "color:",
    //   color,
    // );
    const playerColor: Color = color === "white" ? "black" : "white";
    if (aiResponseWaitRef.current) return;
    aiResponseWaitRef.current = true;

    //List of common opening moves that are standard to be randomized for first move since stockfish always does e2e4 pawn push otherwise
    const openers = [
      "e2e4",
      "d2d4",
      "g1f3",
      "c2c4",
      "b2b3",
      "g2g3",
      "f2f4",
      "b1c3",
      "b2b3",
      "b2b4",
      "e2e3",
    ];

    const enPassant = latestEnPassant(
      board,
      enPassantRef.current,
      enPassantHistoryRef.current,
    );

    try {
      const fen = completeFEN(
        board,
        fenFormat(board),
        color,
        halfRef.current,
        turnRef.current,
        enPassant,
      );
      // console.log("Sent request");

      //First move randomizer since stockfish api always returns e2e4 consistently as first move if playing white
      //Tried lichess but needs a key and didn't want to make an account.
      if (colorAIRef.current === "white" && turnRef.current < 2) {
        const selectedMove =
          openers[Math.floor(Math.random() * openers.length)];
        const from = selectedMove.slice(0, 2);
        const to = selectedMove.slice(2, 4);
        const fromSquare = board.flat().find((sqr) => sqr.coordinate === from);
        const toSquare = board.flat().find((sqr) => sqr.coordinate === to);

        toSquare!.squarePiece = fromSquare!.squarePiece;
        if (fromSquare!.squarePiece?.moved === false) {
          fromSquare!.squarePiece!.moved = true;
        }
        fromSquare!.squarePiece = null;

        autoRankUp(color, board);
        removeCastle();
        turnRef.current++;
        currentTurnRef.current = playerColor;
        fenRef.current.push(
          completeFEN(
            board,
            fenFormat(board),
            color,
            halfRef.current,
            turnRef.current,
          ),
        );
        setClicked(false);
        return;
      }

      //Depth is difficulty, stockfish explores further positions, which results in calculating better moves given its state. Lower depth = lower difficulty
      const depth = difficultyToDepth(gameConfig?.difficulty!);

      //UCI is chess notation, grabbing piece from square -> to square
      const uci = await getStockfishMove(fen, depth);

      removeEnPassant();

      if (!uci) return;

      const { from, to } = uciToSquare(uci as string);
      const fromSquare = board[from.row][from.col];
      const toSquare = board[to.row][to.col];
      const movingPiece = fromSquare.squarePiece;

      toSquare.squarePiece = fromSquare.squarePiece;
      if (fromSquare.squarePiece?.moved === false) {
        fromSquare.squarePiece!.moved = true;
      }
      fromSquare.squarePiece = null;

      //Castling detection. If king moves more than 1 square then it's castling
      if (movingPiece?.type === "king" && Math.abs(to.col - from.col) >= 2) {
        const castleDir = to.col > from.col ? "right" : "left";
        castling(board, color, castleDir);
      }

      halfRef.current =
        toSquare.squarePiece?.type === "pawn" ? 0 : halfRef.current + 1;

      //onSuccessfulMove here causing bugs and infinite recursion, handle AI's move here in isolation instead and have it be called on successful move for AI's turn.
      autoRankUp(color, board);
      removeCastle();
      turnRef.current++;
      currentTurnRef.current = playerColor;
      fenRef.current.push(
        completeFEN(
          board,
          fenFormat(board),
          color,
          halfRef.current,
          turnRef.current,
        ),
      );

      //Check if game is over after move
      const state = getGameState(currentTurnRef.current, board);
      if (state === "checkmate") {
        setWinner(color);
        setGameState("checkmate");
      } else if (state === "stalemate") {
        setGameState("stalemate");
      }

      setClicked(false);
    } finally {
      aiResponseWaitRef.current = false;
      //TODO: Remove debugs
      // console.log("AI move complete --- currentTurnRef:", currentTurnRef.current);
      // console.log("aiResponseWaitRef:", aiResponseWaitRef.current);
      // console.log("vsAIRef:", vsAIRef.current);
      // console.log("colorAIRef:", colorAIRef.current);

      //Rerender board
      forceRender();
    }
  }

  function handleGameStart(config: GameConfig): void {
    //Reset board pieces
    const newBoard = populateBoard(structuredClone(board));
    board.forEach((rank, i) => {
      rank.forEach((square, j) => {
        Object.assign(square, newBoard[i][j]);
      });
    });

    //Reset refs
    halfRef.current = 0;
    turnRef.current = 1;
    checkRef.current = false;
    fenRef.current = [];
    aiResponseWaitRef.current = false;
    currentTurnRef.current = "white";
    firstMoveRef.current = true;
    playerRef.current = config.playerColor ?? "white";
    vsAIRef.current = config.mode === "ai";
    colorAIRef.current = config.playerColor === "white" ? "black" : "white";

    //Reset UI states
    setGameState("ongoing");
    setWinner(undefined);
    setClicked(false);
    setStorePiece(null);
    setPrevSquare(null);

    //Set config LAST so useEffect fires after everything above is set
    setGameConfig(config);
  }

  //On initial render set coordinate strings to all squares on board
  useEffect(() => {
    coordinates(board);
  }, []);

  //On start select game configurations
  useEffect(() => {
    if (
      gameConfig?.mode === "ai" &&
      gameConfig?.playerColor === "black" &&
      firstMoveRef.current
    ) {
      firstMoveRef.current = false;
      handleAiMove("white");
    }
  }, [gameConfig]);

  return (
    <div className="grid grid-cols-8 w-[80vw] md:w-[90vw] lg:w-[95v] max-w-170 aspect-square shadow-2xl">
      {/*Mirror board for player POV using black chess pieces */}
      {(playerRef.current === "black" ? [...board].slice().reverse() : board)
        .flat()
        .map((square) => (
          <SquareTSX
            key={`${square.row}-${square.col}`}
            onClick={parentClick}
            square={square}
            playerColor={playerRef.current}
          />
        ))}
      {!gameConfig && (
        <GameSetupModal onStart={handleGameStart}></GameSetupModal>
      )}
      {showGameOverModal && (
        <GameOverModal
          gameState={gameState}
          winner={winner}
          onRematch={() => handleRematch()}
          onClose={() => setGameState("ongoing")}
        ></GameOverModal>
      )}
    </div>
  );
}
