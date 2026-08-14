import type { Square, ChessBoard, Piece, Move, Color } from "./chessTypes";
import type { GameState } from "../../components/modals/gameover-modal";
import {
  ChessPawn,
  ChessRook,
  ChessKnight,
  ChessBishop,
  ChessQueen,
  ChessKing,
  Undo2,
} from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  autoRankUp,
  bishopMoves,
  check,
  getGameState,
  isFiftyMoveDraw,
  isThreeRepetitionDraw,
  kingMoves,
  knightMoves,
  pawnMoves,
  queenMoves,
  rookMoves,
  simulateMove,
} from "./pieceMoves";
import {
  applyFenToBoard,
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
import {
  createGame,
  fetchChatHistory,
  generateGameID,
  generateUserID,
  getCurrentUserID,
  getGameData,
  joinGame,
  listenToChat,
  listenToGame,
  postChatMessage,
  postDrawForfeit,
  postMove,
  type GameData,
} from "./multiplayer";
import { initAuth } from "../../backend/firebase";
import { Chat, type ChatMessage } from "./Chat";
import { Timer } from "./Timer";

type SquareProps = {
  square: Square;
  onClick: (square: Square) => void;
  playerColor: Color;
};

export function SquareTSX({ square, onClick, playerColor }: SquareProps) {
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
      {square.row === 0 && square.col === 0 && playerColor !== "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          8
        </div>
      )}
      {square.row === 1 && square.col === 0 && playerColor !== "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          7
        </div>
      )}
      {square.row === 2 && square.col === 0 && playerColor !== "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          6
        </div>
      )}
      {square.row === 3 && square.col === 0 && playerColor !== "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          5
        </div>
      )}
      {square.row === 4 && square.col === 0 && playerColor !== "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          4
        </div>
      )}
      {square.row === 5 && square.col === 0 && playerColor !== "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          3
        </div>
      )}
      {square.row === 6 && square.col === 0 && playerColor !== "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          2
        </div>
      )}
      {square.row === 7 && square.col === 0 && playerColor !== "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          1
        </div>
      )}
      {square.row === 0 && square.col === 7 && playerColor === "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          8
        </div>
      )}
      {square.row === 1 && square.col === 7 && playerColor === "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          7
        </div>
      )}
      {square.row === 2 && square.col === 7 && playerColor === "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          6
        </div>
      )}
      {square.row === 3 && square.col === 7 && playerColor === "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          5
        </div>
      )}
      {square.row === 4 && square.col === 7 && playerColor === "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          4
        </div>
      )}
      {square.row === 5 && square.col === 7 && playerColor === "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          3
        </div>
      )}
      {square.row === 6 && square.col === 7 && playerColor === "black" && (
        <div className="absolute mr-[20%] sm:mr-[18%] md:mr-[15%] lg:mr-[12%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          2
        </div>
      )}
      {square.row === 7 && square.col === 7 && playerColor === "black" && (
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
          H
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 6 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          G
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 5 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          F
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 4 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          E
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 3 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          D
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 2 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          C
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 1 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
          B
        </div>
      )}
      {square.row === 0 && playerColor === "black" && square.col === 0 && (
        <div className="absolute mb-[-20%] sm:mb-[-18%] md:mt-[0%] lg:mt-[-3%] xl:mt-[-8%] text-2xl sm:text-3xl md:text-4xl lg:text-5xl pointer-events-none">
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
  const [_, setHighlightedSquares] = useState<Square[]>([]);
  const [gameState, setGameState] = useState<GameState>("ongoing");
  const [winner, setWinner] = useState<Color | undefined>(undefined);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [, setAuthReady] = useState(false);
  const [, forceRender] = useReducer((x) => x + 1, 0);
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [, setDrawOfferedByOpponent] = useState(false);

  const currentTurnRef = useRef<Color>("white");
  const turnRef = useRef(0);
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
  const boardHistoryRef = useRef<
    {
      board: ChessBoard;
      turn: Color;
      halfMove: number;
      fullMove: number;
      enPassant: string | null;
      firstMove: boolean;
    }[]
  >([]);
  const boardHistoryIndexRef = useRef(0);
  const gameIDRef = useRef<string | null>(null);
  const userIDRef = useRef<string>(generateUserID());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const gameStateRef = useRef<GameState>("ongoing");
  const gameStartRef = useRef(false);
  const lastHandledDrawRef = useRef<string | null>(null);
  const timerResetRef = useRef<number>(0);

  const showGameOverModal = gameState !== "ongoing";

  const timerSeconds = gameConfig?.timerSeconds ?? 300;
  const timerIncrement = gameConfig?.timerIncrement ?? 0;

  function handleTimeout(loser: Color): void {
    const winner: Color = loser === "white" ? "black" : "white";
    setWinner(winner);
    updateGameState("timeout");
    gameStateRef.current = "timeout";
  }

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
    }
    if (square && square.squarePiece!.type === "knight") {
      moves = knightMoves(square.squarePiece!, square, board);
    }

    //Filter moves based on if player would be in check or not after getting list of all moves
    return moves.filter((move) => {
      const isLegal = !simulateMove(
        square,
        board,
        { ...square, row: move.row, col: move.col },
        currentTurnRef.current,
      );
      return isLegal;
    });
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
      if (move.enPassant && move.col === square!.col) {
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
    const dir = player === "white" ? 1 : -1;
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

    //Raise after white's turn
    if (currentTurnRef.current === "white") turnRef.current++;

    //Raise on other turn in multiplayer due to latency
    if (
      currentTurnRef.current === "black" &&
      gameConfig?.mode === "multiplayer"
    )
      turnRef.current++;

    removeEnPassant(board);

    if (enPassant) {
      board.flat().forEach((sqr) => {
        if (sqr.coordinate === enPassantRef.current[0]) {
          const pawnRow = sqr.row === 2 ? 3 : 4;
          board[pawnRow][sqr.col].enPassant = true;
          sqr.enPassantTake = true;
        }
      });
    }

    if (enPassant) {
      board.flat().forEach((sqr) => {
        if (sqr.coordinate === enPassant) {
          sqr.enPassantTake = true;
        }
      });
    }

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

    const state = getGameState(nextPlayer, board);
    if (state === "checkmate") {
      setWinner(currentTurnRef.current === "white" ? "black" : "white");
      gameStateRef.current = "checkmate";
      updateGameState("checkmate");
    } else if (state === "stalemate") {
      gameStateRef.current = "stalemate";
      updateGameState("stalemate");
    } else if (isFiftyMoveDraw(halfRef.current)) {
      gameStateRef.current = "draw";
      updateGameState("draw");
    } else if (isThreeRepetitionDraw(fenRef.current)) {
      gameStateRef.current = "draw";
      updateGameState("draw");
    }

    //Post to Firebase if online
    if (gameConfig?.mode === "multiplayer" && gameIDRef.current) {
      const multiplayerWinner =
        currentTurnRef.current === "white" ? "black" : "white";
      setWinner(multiplayerWinner);
      postMove(
        gameIDRef.current,
        fenRef.current[fenRef.current.length - 1],
        nextPlayer,
        `${Date.now()}`,
        gameStateRef.current,
        multiplayerWinner,
      );
    }

    if (vsAIRef.current && nextPlayer === colorAIRef.current) {
      handleAiMove(colorAIRef.current);
    }

    boardHistoryRef.current = boardHistoryRef.current.slice(
      0,
      boardHistoryIndexRef.current + 1,
    );

    boardHistoryRef.current.push({
      board: structuredClone(board),
      turn: currentTurnRef.current,
      halfMove: halfRef.current,
      fullMove: turnRef.current,
      enPassant: enPassantRef.current[0] ?? null,
      firstMove: firstMoveRef.current,
    });
    boardHistoryIndexRef.current++;

    if (firstMoveRef.current === true) {
      firstMoveRef.current = false;
    }

    gameStartRef.current = true;
  }

  //Goes through board and changes castle flag
  function removeCastle(): void {
    let squares = board.flat();
    squares.forEach((square) => {
      square.castle = false;
      square.castleDir = "";
    });
  }

  //Goes through board and changes en passant flag to false
  function removeEnPassant(board: ChessBoard): void {
    board.flat().forEach((sqr) => {
      sqr.enPassant = false;
      sqr.enPassantTake = false;
    });
  }

  function parentClick(square: Square): void {
    if (gameStateRef.current !== "ongoing") return;
    if (
      gameConfig?.mode !== "local" &&
      currentTurnRef.current !== playerRef.current
    ) {
      return;
    }
    handleClick(square);
    onlyMoveOnTurn(square);
    checkRef.current = check(currentTurnRef.current, board);
  }

  //Selects square
  function selectSquare(square: Square): void {
    setClicked(true);
    setPrevSquare(square);
    setStorePiece(square.squarePiece);
    square.selected = true;
    highlightLegalMoves(getLegalMoves(square));
  }

  //Clear selected piece
  function clearSelection(): void {
    if (prevSquare) prevSquare.selected = false;
    setStorePiece(null);
    setPrevSquare(null);
    setClicked(false);
    unHighlight();
  }

  //Switches selected piece with another
  function switchSelection(prevSquare: Square, square: Square): void {
    prevSquare.selected = false;
    setStorePiece(square.squarePiece);
    setPrevSquare(square);
    unHighlight();
    highlightLegalMoves(getLegalMoves(square));
    square.selected = true;
  }

  //Checks if legal, where the next move does not leave the king in
  function isLegalDestination(prevSquare: Square, square: Square): boolean {
    if (!square.highlighted) return false;
    const leavesKingInCheck = simulateMove(
      prevSquare,
      board,
      square,
      currentTurnRef.current,
    );
    return !leavesKingInCheck;
  }

  //Simulates move
  function attemptMove(
    prevSquare: Square,
    square: Square,
    storePiece: Piece,
    playerIsInCheck: boolean,
  ): boolean {
    if (!isLegalDestination(prevSquare, square)) return false;

    const isEnPassantCapture =
      square.enPassantTake &&
      storePiece.type === "pawn" &&
      square.squarePiece === null &&
      Math.abs(prevSquare.col - square.col) === 1;
    const isCapture = square.squarePiece !== null || isEnPassantCapture;

    logMove(
      playerIsInCheck ? turnRef.current : turnRef.current + 1,
      storePiece.type,
      isCapture ? "takes" : "moves",
      prevSquare.coordinate,
      square.coordinate,
    );

    //Move piece to the destination square
    square.squarePiece = storePiece;
    if (prevSquare.squarePiece?.moved === false) {
      prevSquare.squarePiece.moved = true;
    }
    prevSquare.squarePiece = null;
    prevSquare.selected = false;

    //Special moves only relevant on moving piece to empty square
    if (square.castle) {
      castling(board, currentTurnRef.current, square.castleDir!);
    }
    if (isEnPassantCapture) {
      enPassant(board, square, currentTurnRef.current);
    }

    //Fifty-move-rule clock resets on any pawn move or capture
    halfRef.current =
      storePiece.type === "pawn" || isCapture ? 0 : halfRef.current + 1;
    checkRef.current = false;
    setClicked(false);
    setPrevSquare(null);
    setStorePiece(null);
    unHighlight();
    onSuccessfulMove();
    return true;
  }

  //Refactored handleclick
  function handleClick(square: Square): void {
    if (gameStateRef.current !== "ongoing") return;

    const playerIsInCheck = check(currentTurnRef.current, board);

    //Nothing selected yet
    if (!click) {
      if (square.squarePiece) {
        selectSquare(square);
      } else {
        clearSelection();
      }
      return;
    }

    //If piece is already selected
    if (!prevSquare || storePiece === null) return; //Defensive, shouldn't happen if click is true

    //Clicked on another square with piece
    if (square.squarePiece) {
      //If clicked on same square again, unselect
      if (prevSquare === square) {
        clearSelection();
      }
      //If selected a different, but same color piece
      else if (prevSquare.squarePiece?.color === square.squarePiece.color) {
        switchSelection(prevSquare, square);
      }
      //Otherwise simulate move on square with enemy piece
      else {
        const moved = attemptMove(
          prevSquare,
          square,
          storePiece,
          playerIsInCheck,
        );
        if (!moved) clearSelection();
      }
    }
    //If clicking on square with no piece
    else {
      const moved = attemptMove(
        prevSquare,
        square,
        storePiece,
        playerIsInCheck,
      );
      if (!moved) clearSelection();
    }
  }

  //Sets game to be in playable state and restarts game config modal
  function handleRematch(): void {
    updateGameState("ongoing");
    setGameConfig(null);
    const baseState = boardHistoryRef.current[0];
    boardHistoryRef.current.forEach((_) => {
      boardHistoryRef.current.pop();
    });
    boardHistoryRef.current.push(baseState);
    boardHistoryRef.current.push(baseState);
    setChatMessages([]);
    gameStartRef.current = false;
    timerResetRef.current++;
  }

  async function handleAiMove(color: Color): Promise<void> {
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

      //First move randomizer since stockfish api always returns e2e4 consistently as first move if playing white
      //Tried lichess but needs a key and didn't want to make an account.
      if (colorAIRef.current === "white" && turnRef.current === 0) {
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
        logMove(1, "pawn", "moves", from, to);
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
        gameStartRef.current = true;

        return;
      }

      //Depth is difficulty, stockfish explores further positions, which results in calculating better moves given its state. Lower depth = lower difficulty
      const depth = difficultyToDepth(gameConfig?.difficulty!);

      //UCI is chess notation, grabbing piece from square -> to square
      const uci = await getStockfishMove(fen, depth);

      removeEnPassant(board);

      if (!uci) return;

      const { from, to } = uciToSquare(uci as string);
      const fromSquare = board[from.row][from.col];
      const toSquare = board[to.row][to.col];
      const movingPiece = fromSquare.squarePiece;
      const wasCapture = toSquare.squarePiece !== null;
      const pieceType = movingPiece?.type ?? "pawn";

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

      if (playerColor === "white") {
        turnRef.current++;
        logMove(
          turnRef.current,
          pieceType,
          wasCapture ? "takes" : "moves",
          board[from.row][from.col].coordinate,
          board[to.row][to.col].coordinate,
        );
      } else {
        logMove(
          turnRef.current + 1,
          pieceType,
          wasCapture ? "takes" : "moves",
          board[from.row][from.col].coordinate,
          board[to.row][to.col].coordinate,
        );
      }

      //Check if game is over after move
      const state = getGameState(currentTurnRef.current, board);
      if (state === "checkmate") {
        setWinner(color);
        updateGameState("checkmate");
        gameStartRef.current = false;
      } else if (state === "stalemate") {
        updateGameState("stalemate");
      }

      setClicked(false);
    } finally {
      aiResponseWaitRef.current = false;

      //Rerender board
      boardHistoryRef.current.push({
        board: structuredClone(board),
        turn: currentTurnRef.current,
        halfMove: halfRef.current,
        fullMove: turnRef.current,
        enPassant: enPassantRef.current[0] ?? null,
        firstMove: firstMoveRef.current,
      });
      boardHistoryIndexRef.current++;
      forceRender();
    }
  }

  function updateGameState(state: GameState): void {
    gameStateRef.current = state;
    setGameState(state);
    if (gameStateRef.current !== "ongoing") gameStartRef.current = false;
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
    turnRef.current = 0;
    checkRef.current = false;
    fenRef.current = [];
    aiResponseWaitRef.current = false;
    currentTurnRef.current = "white";
    firstMoveRef.current = true;
    playerRef.current = config.playerColor ?? "white";
    vsAIRef.current = config.mode === "ai";
    colorAIRef.current = config.playerColor === "white" ? "black" : "white";
    gameStartRef.current = false;

    //Reset UI states
    updateGameState("ongoing");
    setWinner(undefined);
    setClicked(false);
    setStorePiece(null);
    setPrevSquare(null);

    //Set config LAST so useEffect fires after everything above is set
    setGameConfig(config);
  }

  function undo(): void {
    if (boardHistoryIndexRef.current - 1 < 0) {
      return;
    }
    if (gameConfig?.mode === "ai") {
      if (boardHistoryIndexRef.current - 2 < 0) {
        return;
      } else boardHistoryIndexRef.current--;
    }

    boardHistoryIndexRef.current--;
    const prev = boardHistoryRef.current[boardHistoryIndexRef.current]!;

    board.forEach((rank, i) => {
      rank.forEach((square, j) => {
        Object.assign(square, prev.board[i][j]);
        if (boardHistoryIndexRef.current === 0) {
          if (square.squarePiece) {
            square.squarePiece.moved = false;
          }
        }
      });
    });

    currentTurnRef.current = prev.turn;
    halfRef.current = prev.halfMove;
    turnRef.current = prev.fullMove;
    enPassantRef.current = prev.enPassant ? [prev.enPassant] : [];
    firstMoveRef.current = prev.firstMove;
    fenRef.current.pop();

    setGameState("ongoing");
    gameStateRef.current = "ongoing";
    setClicked(false);
    setStorePiece(null);
    setPrevSquare(null);
    unHighlight();
  }

  async function handleCreateGame(
    playerColor: "white" | "black",
    timerSeconds: number,
    timerIncrement: number,
  ): Promise<void> {
    const gameId = generateGameID();
    gameIDRef.current = gameId;
    playerRef.current = playerColor;
    colorAIRef.current = playerColor === "white" ? "black" : "white";

    await createGame(
      gameId,
      getCurrentUserID(),
      playerColor,
      timerSeconds ?? 300,
      timerIncrement ?? 0,
    );
    setGameCode(gameId);
    setWaitingForOpponent(true);

    //Listen for opponent joining, then switch to game listener
    const unsub = listenToGame(gameId, (data) => {
      if (data.status === "ongoing") {
        setWaitingForOpponent(false);
        //Unsubscribe waiting listener before starting game listener
        unsub();
        unsubscribeRef.current = null;
        startOnlineGame(null);

        //Set game config so the board renders and piece locking works
        handleGameStart({
          mode: "multiplayer",
          playerColor,
          timerSeconds: data.timerSeconds ?? 300,
          timerIncrement: data.timerIncrement ?? 0,
        });
      }
    });
    unsubscribeRef.current = unsub;
  }

  async function handleJoinGame(gameId: string): Promise<void> {
    gameIDRef.current = gameId;

    const result = await joinGame(gameId, getCurrentUserID());
    if (!result.success || !result.assignedColor) {
      console.error("Failed to join game");
      return;
    }

    playerRef.current = result.assignedColor;

    const gameData = await getGameData(gameId);

    handleGameStart({
      mode: "multiplayer",
      playerColor: result.assignedColor,
      timerSeconds: gameData?.timerSeconds ?? 300,
      timerIncrement: gameData?.timerIncrement ?? 0,
    });
    startOnlineGame(null);
  }

  //initialData
  async function startOnlineGame(_: GameData | null): Promise<void> {
    if (!gameIDRef.current) return;

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    //Load history
    const chatHistory = await fetchChatHistory(gameIDRef.current);
    setChatMessages(chatHistory);

    //Track last loaded entry
    const lastHistory =
      chatHistory.length > 0
        ? Math.max(...chatHistory.map((e) => e.timestamp))
        : 0;

    const gameUnsub = listenToGame(gameIDRef.current, (data) => {
      const winner = data.winner !== null ? data.winner : undefined;

      if (data.status === "finished" && gameStateRef.current === "ongoing") {
        if (data.gameState === "checkmate") {
          setWinner(winner);
          updateGameState("checkmate");
          return;
        } else if (data.gameState === "stalemate") {
          updateGameState("stalemate");
          return;
        } else if (data.gameState === "draw") {
          updateGameState("draw");
          return;
        } else if (data.gameState === "forfeit") {
          updateGameState("forfeit");
          return;
        }
      }

      if (
        data.lastMove !== null &&
        data.currentTurn === playerRef.current &&
        data.status === "ongoing"
      ) {
        applyFenToBoard(data.fen, board);
        currentTurnRef.current = data.currentTurn;
        if (data.lastMove !== undefined) {
          gameStartRef.current = true;
        }
        forceRender();
      }

      if (data.draw && data.drawBy !== playerRef.current) {
        const drawSignature = `${data.draw}:${data.drawBy}:${data.lastMove ?? "start"}`;
        const alreadyHandled = lastHandledDrawRef.current === drawSignature;

        if (data.draw === "draw_offer" && !alreadyHandled) {
          lastHandledDrawRef.current = drawSignature;
          setDrawOfferedByOpponent(true);
        } else if (data.draw === "draw_accept" && !alreadyHandled) {
          lastHandledDrawRef.current = drawSignature;
          setDrawOfferedByOpponent(false);
          updateGameState("draw");
        } else if (data.draw === "draw_decline" && !alreadyHandled) {
          lastHandledDrawRef.current = drawSignature;
          setDrawOfferedByOpponent(false);
        } else if (data.draw === "forfeit" && !alreadyHandled) {
          lastHandledDrawRef.current = drawSignature;
          const winner: Color = data.drawBy === "white" ? "black" : "white";
          setWinner(winner);
          updateGameState("forfeit");
        }
      }
    });

    //Listen for new chat entries
    const chatUnsub = listenToChat(gameIDRef.current, (entry) => {
      if (entry.timestamp <= lastHistory) return;

      setChatMessages((prev) => {
        const alreadyExists = prev.some(
          (e) => e.timestamp === entry.timestamp && e.type === entry.type,
        );
        return alreadyExists ? prev : [...prev, entry];
      });
    });

    //Stop listening
    unsubscribeRef.current = () => {
      gameUnsub();
      chatUnsub();
    };
  }

  //Logs move to chat
  function logMove(
    turn: number,
    piece: string,
    action: "moves" | "takes",
    from: string,
    to: string,
  ): void {
    const entry: ChatMessage = {
      type: "move",
      turn,
      piece,
      action,
      from,
      to,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, entry]);

    if (gameConfig?.mode === "multiplayer" && gameIDRef.current) {
      postChatMessage(gameIDRef.current, entry);
    }
  }

  //Sends message
  function handleSendMessage(text: string): void {
    const message: ChatMessage = {
      type: "message",
      sender: playerRef.current,
      text,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, message]);

    if (gameConfig?.mode === "multiplayer" && gameIDRef.current) {
      postChatMessage(gameIDRef.current, message);
    }
  }

  function handleDraw(): void {
    const entry: ChatMessage = {
      type: "draw_offer",
      sender: playerRef.current,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, entry]);

    if (gameConfig?.mode === "multiplayer" && gameIDRef.current) {
      //Posts to opponent
      postDrawForfeit(gameIDRef.current, "draw_offer", playerRef.current);
      postChatMessage(gameIDRef.current, entry);
    } else {
      //Local mode auto shows draw offer in chat, other player clicks accept. Not sure if really needed.
    }
  }

  function handleDrawResponse(accepted: boolean): void {
    const responseEntry: ChatMessage = {
      type: "message",
      sender: playerRef.current,
      text: accepted ? "Draw accepted" : "Draw declined",
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, responseEntry]);

    if (accepted) {
      updateGameState("draw");
      if (gameConfig?.mode === "multiplayer" && gameIDRef.current) {
        postChatMessage(gameIDRef.current, responseEntry);
        postDrawForfeit(gameIDRef.current, "draw_accept", playerRef.current);
        postMove(
          gameIDRef.current,
          fenRef.current[fenRef.current.length - 1],
          currentTurnRef.current,
          `${Date.now()}`,
          "draw",
          null,
        );
      }
    } else {
      if (gameConfig?.mode === "multiplayer" && gameIDRef.current) {
        postChatMessage(gameIDRef.current, responseEntry);
        postDrawForfeit(gameIDRef.current, "draw_decline", playerRef.current);
      }
    }
  }

  function handleForfeit(): void {
    const winner: Color = playerRef.current === "white" ? "black" : "white";
    setChatMessages((prev) => [
      ...prev,
      {
        type: "message",
        sender: playerRef.current,
        text: `${playerRef.current.charAt(0).toUpperCase() + playerRef.current.slice(1)} forfeits`,
        timestamp: Date.now(),
      },
    ]);
    setWinner(winner);
    updateGameState("forfeit");

    if (gameConfig?.mode === "multiplayer" && gameIDRef.current) {
      postDrawForfeit(gameIDRef.current, "forfeit", playerRef.current);
      postMove(
        gameIDRef.current,
        fenRef.current[fenRef.current.length - 1],
        currentTurnRef.current,
        `${Date.now()}`,
        "forfeit",
        winner,
      );
    }
  }

  //On initial render set coordinate strings to all squares on board
  useEffect(() => {
    coordinates(board);

    boardHistoryRef.current.push({
      board: structuredClone(board),
      turn: currentTurnRef.current,
      halfMove: halfRef.current,
      fullMove: turnRef.current,
      enPassant: enPassantRef.current[0] ?? null,
      firstMove: firstMoveRef.current,
    });

    initAuth().then((uid) => {
      userIDRef.current = uid;
      setAuthReady(true);
    });
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

  useEffect(() => {
    forceRender();
  }, [boardHistoryRef.current]);

  return (
    <div className="flex flex-row place-items-center max-w-full min-w-0 md:gap-10 2xl:gap-0">
      {/*Undo button, doesn't show up in multiplayer. TODO: Shows up in multiplayer after game end just to review game */}
      {(gameConfig?.mode === "ai" || gameConfig?.mode === "local") && (
        <button
          type="button"
          onClick={() => undo()}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)\"
        >
          <Undo2 /> <span className="text-sm font-medium">Undo</span>
        </button>
      )}

      <div className="flex items-center min-w-0 w-[80vw] lg:w-[40vw] md:w-[45vw] md:ml-11 sm:w-[67vw]">
        <div className="grid grid-cols-8 w-[90vw] md:w-[80vw] lg:w-[90v] max-w-170 aspect-square shadow-2xl min-w-0">
          {/*Mirror board for player POV using black chess pieces */}
          {(playerRef.current === "black"
            ? [...board].flat().slice().reverse()
            : board
          )
            .flat()
            .map((square) => (
              <SquareTSX
                key={`${square.row}-${square.col}`}
                onClick={parentClick}
                square={square}
                playerColor={playerRef.current}
              />
            ))}
        </div>
      </div>

      {/*Chat */}
      <div className="hidden md:block md:h-[45vh] md:max-h-100 lg:h-[60dvh] lg:max-h-120 xl:h-[60dvh] xl:max-h-full 2xl:h-[69dvh]">
        <Chat
          entries={chatMessages}
          onSendMessage={handleSendMessage}
          playerColor={playerRef.current}
          onDrawOffer={handleDraw}
          onDrawResponse={handleDrawResponse}
          onForfeit={handleForfeit}
          vsAI={vsAIRef.current || gameConfig?.mode === "local"}
          gameState={gameState}
        />
        <div className="flex gap-10 pt-3">
          <Timer
            key={`white-${gameIDRef.current ?? timerResetRef.current}`}
            initialSeconds={timerSeconds}
            isActive={
              currentTurnRef.current === playerRef.current &&
              gameState === "ongoing" &&
              gameStartRef.current
            }
            isGameOver={gameState !== "ongoing"}
            increment={timerIncrement}
            onTimeout={() => handleTimeout(playerRef.current)}
            label={playerRef.current === "white" ? "White" : "Black"}
          />
          <Timer
            key={`black-${gameIDRef.current ?? timerResetRef.current}`}
            initialSeconds={timerSeconds}
            isActive={
              currentTurnRef.current !== playerRef.current &&
              gameState === "ongoing" &&
              gameStartRef.current
            }
            isGameOver={gameState !== "ongoing"}
            increment={timerIncrement}
            onTimeout={() =>
              handleTimeout(playerRef.current === "white" ? "black" : "white")
            }
            label={playerRef.current === "white" ? "Black" : "White"}
          />
        </div>
      </div>

      {/* Game config and game over modals */}
      {!gameConfig && (
        <GameSetupModal
          onStart={handleGameStart}
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          gameCode={gameCode}
          waitingForOpponent={waitingForOpponent}
        ></GameSetupModal>
      )}
      {showGameOverModal && (
        <GameOverModal
          gameState={gameState}
          winner={winner}
          onRematch={() => handleRematch()}
          onClose={() => updateGameState("closed")}
        ></GameOverModal>
      )}
    </div>
  );
}
