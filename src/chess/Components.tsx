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
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
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
  createEmptyBoard,
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
  fetchChatHistory,
  generateUserID,
  getGameData,
  listenToChat,
  listenToGame,
  postChatMessage,
  postDrawForfeit,
  postMove,
  type GameData,
} from "./multiplayer";
import {
  clearPersistedGame,
  createInitialPersistedGame,
  generateUniqueLobbyID,
  loadPersistedGame,
  parseFen,
  savePersistedGame,
  type PersistedGame,
} from "./lobbyStorage";
import { initAuth } from "../../backend/firebase";
import { Chat, type ChatMessage } from "./Chat";
import { Timer } from "./Timer";
import { useGameSetup } from "./useGameSetup";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

//How long a piece takes to slide between squares. Tweak to taste.
const moveAnimationDuration = 0.35;

function PieceIcon({ piece }: { piece: Piece }) {
  const color = piece.color === "white" ? undefined : "#000000";
  const className = "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12";
  switch (piece.type) {
    case "pawn":
      return <ChessPawn size={21} color={color} className={className} />;
    case "rook":
      return <ChessRook size={21} color={color} className={className} />;
    case "knight":
      return <ChessKnight size={21} color={color} className={className} />;
    case "bishop":
      return <ChessBishop size={21} color={color} className={className} />;
    case "queen":
      return <ChessQueen size={21} color={color} className={className} />;
    case "king":
      return <ChessKing size={21} color={color} className={className} />;
    default:
      return null;
  }
}

//layoutId lets framer-motion slide a piece between squares whenever it changes
//position. Stable piece ids mean this fires on real moves (your turn, the AI's,
//or the opponent's move synced over firebase) but not on a fresh mount. The
//wrapper fills the square and stays out of flow so it never affects the grid.
function AnimatedPiece({ piece }: { piece: Piece }) {
  return (
    <motion.div
      key={piece.id}
      layoutId={piece.id}
      className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
      transition={{ duration: moveAnimationDuration, ease: "easeInOut" }}
    >
      <PieceIcon piece={piece} />
    </motion.div>
  );
}

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
      {square.squarePiece && (
        <div className="relative w-full h-full">
          {square.squarePiece.color === "white" &&
          square.squarePiece.type === "pawn" ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              draggable
              onDragOver={(e) => e.preventDefault()}
            >
              <AnimatedPiece piece={square.squarePiece} />
            </div>
          ) : (
            <AnimatedPiece piece={square.squarePiece} />
          )}
        </div>
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
  const configRef = useRef<GameConfig | null>(null);
  const winnerRef = useRef<Color | undefined>(undefined);
  const chatMessagesRef = useRef<ChatMessage[]>([]);
  const timersRef = useRef<{ white: number | null; black: number | null }>({
    white: null,
    black: null,
  });
  const lastSyncedFenRef = useRef("");
  //First fen pushed by firebase after (re)connecting rebuilds the board from
  //scratch; only reuse piece ids on subsequent syncs so live moves animate but
  //a mid-game reconnect does not replay transitions for moves that already happened.
  const preserveIdsRef = useRef(false);

  //Navigation + lobby id routing. While restoring, will hide the setup modal briefly while an online game reconnects for smoother experience
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [restoring, setRestoring] = useState(() => {
    if (!params.id) return false;
    return loadPersistedGame(params.id) !== null;
  });
  const { gameCode, waitingForOpponent, handleCreateGame, handleJoinGame } =
    useGameSetup(({ config, gameID }) => {
      //Online game loads and persists the reconnect session, then navigates to /game/[code].
      savePersistedGame(createInitialPersistedGame(gameID, config));
      navigate(`/game/${gameID}`);
    });

  const showGameOverModal = gameState !== "ongoing";

  const timerSeconds = gameConfig?.timerSeconds ?? 300;
  const timerIncrement = gameConfig?.timerIncrement ?? 0;
  const timerEnabled = gameConfig?.timerEnabled ?? true;

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

  //Rematch abandons the current lobby and clears relevant variables
  function handleRematch(): void {
    if (gameIDRef.current) clearPersistedGame(gameIDRef.current);
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
    gameIDRef.current = null;
    timersRef.current = { white: null, black: null };
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
    //On close clear local storage
    if (state === "closed" && gameIDRef.current) {
      clearPersistedGame(gameIDRef.current);
    }
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
    timerResetRef.current++;
    enPassantRef.current = [];
    enPassantHistoryRef.current = [];
    lastSyncedFenRef.current = "";
    preserveIdsRef.current = false;

    boardHistoryRef.current = [
      {
        board: structuredClone(board),
        turn: "white",
        halfMove: 0,
        fullMove: 0,
        enPassant: null,
        firstMove: true,
      },
    ];
    boardHistoryIndexRef.current = 0;
    timersRef.current = {
      white: config.timerEnabled === false ? 0 : (config.timerSeconds ?? 300),
      black: config.timerEnabled === false ? 0 : (config.timerSeconds ?? 300),
    };

    //Reset UI states
    updateGameState("ongoing");
    setWinner(undefined);
    setClicked(false);
    setStorePiece(null);
    setPrevSquare(null);

    //Set config LAST so useEffect fires after everything above is set
    setGameConfig(config);
  }

  //Starts a local/ai game from the in-game setup modal with fresh game ID
  async function handleModalStart(config: GameConfig): Promise<void> {
    const id = await generateUniqueLobbyID();
    gameIDRef.current = id;
    handleGameStart(config);
    navigate(`/game/${id}`, { replace: true });
  }

  //Restores a saved local/ai game from local storage and rebuilds the board utilizing saved states from
  function restoreGame(persisted: PersistedGame): void {
    const fresh = populateBoard(structuredClone(board));
    board.forEach((rank, i) => {
      rank.forEach((square, j) => {
        Object.assign(square, fresh[i][j]);
      });
    });
    coordinates(board);

    const lastFen = persisted.fenHistory[persisted.fenHistory.length - 1];
    if (lastFen) applyFenToBoard(lastFen, board);

    const scratch = createEmptyBoard();
    boardHistoryRef.current = [];
    persisted.fenHistory.forEach((fen, i) => {
      applyFenToBoard(fen, scratch);
      const parsed = parseFen(fen);
      boardHistoryRef.current.push({
        board: structuredClone(scratch),
        turn: parsed.turn,
        halfMove: parsed.halfMove,
        fullMove: parsed.fullMove,
        enPassant: parsed.enPassant,
        firstMove: i === 0,
      });
    });
    boardHistoryIndexRef.current = persisted.fenHistory.length - 1;

    halfRef.current = persisted.halfMove;
    turnRef.current = persisted.turn;
    currentTurnRef.current = persisted.currentTurn;
    playerRef.current = persisted.playerColor;
    vsAIRef.current = persisted.vsAI;
    colorAIRef.current = persisted.colorAI;
    firstMoveRef.current = persisted.fenHistory.length <= 1;
    enPassantHistoryRef.current = persisted.enPassantHistory ?? [];
    enPassantRef.current = board
      .flat()
      .filter((s) => s.enPassantTake)
      .map((s) => s.coordinate);
    fenRef.current = persisted.fenHistory.slice(1);
    checkRef.current = check(currentTurnRef.current, board);
    gameStartRef.current = persisted.fenHistory.length > 1;
    aiResponseWaitRef.current = false;
    timersRef.current = persisted.timers ?? {
      white: persisted.config.timerSeconds ?? 300,
      black: persisted.config.timerSeconds ?? 300,
    };

    gameIDRef.current = persisted.id;
    setChatMessages(persisted.chatMessages);
    setClicked(false);
    setStorePiece(null);
    setPrevSquare(null);
    updateGameState(persisted.gameState);
    setWinner(persisted.winner);

    setGameConfig(persisted.config);
    setRestoring(false);
  }

  //Reconnects to a multiplayer game using the lobby id in the url. The
  //player's color is verified against firebase with their anonymous uid.
  //Just to prevent potential cheating with local storage edits
  async function reconnectOnline(
    routeID: string,
    persisted: PersistedGame,
  ): Promise<void> {
    const uid = await initAuth();
    userIDRef.current = uid;

    let data: GameData | null;
    try {
      data = await getGameData(routeID);
    } catch {
      data = null;
    }

    if (!data || data.status === "waiting") {
      clearPersistedGame(routeID);
      setRestoring(false);
      return;
    }

    const isWhite = data.playerWhite === uid;
    const isBlack = data.playerBlack === uid;

    let color: Color | null = null;
    if (isWhite && isBlack) {
      //Same anonymous uid occupies both slots (local dev testing on one browser)
      color = persisted.playerColor ?? "white";
    } else if (isWhite) {
      color = "white";
    } else if (isBlack) {
      color = "black";
    }

    if (!color) {
      //Not a participant of this game, don't let them in
      clearPersistedGame(routeID);
      setRestoring(false);
      return;
    }

    gameIDRef.current = routeID;
    const config: GameConfig = {
      mode: "multiplayer",
      playerColor: color,
      timerSeconds: data.timerSeconds ?? 300,
      timerIncrement: data.timerIncrement ?? 0,
      timerEnabled: data.timerEnabled ?? true,
    };
    handleGameStart(config);
    timersRef.current = persisted.timers ?? {
      white: config.timerEnabled === false ? 0 : config.timerSeconds,
      black: config.timerEnabled === false ? 0 : config.timerSeconds,
    };

    setRestoring(false);
    startOnlineGame(null);
  }

  //Persists the current game to localStorage, keyed by the lobby id. Different stuff is saved depending on if online or not.
  const persistSession = useCallback(() => {
    const id = gameIDRef.current;
    const config = configRef.current;
    if (!id || !config) return;

    const timerSeconds = config.timerSeconds ?? 300;
    const base = {
      id,
      config,
      gameState: gameStateRef.current,
      winner: winnerRef.current,
      currentTurn: currentTurnRef.current,
      halfMove: halfRef.current,
      turn: turnRef.current,
      playerColor: playerRef.current,
      vsAI: vsAIRef.current,
      colorAI: colorAIRef.current,
      firstMove: firstMoveRef.current,
      timers: {
        white: timersRef.current.white ?? timerSeconds,
        black: timersRef.current.black ?? timerSeconds,
      },
    };

    if (config.mode === "multiplayer") {
      //Online state lives in firebase; just persist the reconnect session
      savePersistedGame({
        ...base,
        mode: "multiplayer",
        fenHistory: [],
        chatMessages: [],
        enPassantHistory: [],
      });
      return;
    }

    const history = boardHistoryRef.current.slice(
      0,
      boardHistoryIndexRef.current + 1,
    );
    savePersistedGame({
      ...base,
      mode: config.mode,
      fenHistory: history.map((h) =>
        completeFEN(
          h.board,
          fenFormat(h.board),
          h.turn,
          h.halfMove,
          h.fullMove,
          h.enPassant ?? undefined,
        ),
      ),
      chatMessages: chatMessagesRef.current,
      enPassantHistory: enPassantHistoryRef.current,
    });
  }, []);

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
    persistSession();
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

      //Sync the board with the authoritative firebase state so a refresh/reconnect mid-game shows correctly.
      if (data.status !== "waiting") {
        currentTurnRef.current = data.currentTurn;
        if (data.lastMove) gameStartRef.current = true;
        if (data.fen && data.fen !== lastSyncedFenRef.current) {
          applyFenToBoard(data.fen, board, preserveIdsRef.current);
          preserveIdsRef.current = true;
          lastSyncedFenRef.current = data.fen;
          forceRender();
        }
      }

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

    initAuth().then((uid) => {
      userIDRef.current = uid;
      setAuthReady(true);
    });
  }, []);

  //Restores a lobby for the current game based on mode and id. Keyed on params.id instead of mount-only
  //because otherwise the new game modal would not disappear on new game start after completing a game
  useEffect(() => {
    const routeID = params.id;
    if (!routeID) return;

    const persisted = loadPersistedGame(routeID);
    if (!persisted) return;
    if (routeID === gameIDRef.current) return; //Already on this lobby

    if (persisted.mode === "multiplayer") {
      setRestoring(true);
      reconnectOnline(routeID, persisted);
    } else {
      restoreGame(persisted);
    }
  }, [params.id]);

  //Mirrors react state into refs so persistence always reads fresh values
  useEffect(() => {
    configRef.current = gameConfig;
    winnerRef.current = winner;
    chatMessagesRef.current = chatMessages;
  }, [gameConfig, winner, chatMessages]);

  //Persists on every committed change to the game state
  useEffect(() => {
    if (!configRef.current || !gameIDRef.current) return;
    persistSession();
  }, [gameConfig, gameState, winner, chatMessages]);

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

  //Resumes an AI game after refresh where it was the AI's turn to move
  useEffect(() => {
    if (gameConfig?.mode !== "ai") return;
    if (
      vsAIRef.current &&
      currentTurnRef.current === colorAIRef.current &&
      gameStartRef.current
    ) {
      handleAiMove(colorAIRef.current);
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
            initialRemaining={timersRef.current.white ?? undefined}
            isActive={
              currentTurnRef.current === playerRef.current &&
              gameState === "ongoing" &&
              gameStartRef.current
            }
            isGameOver={gameState !== "ongoing"}
            increment={timerIncrement}
            countUp={!timerEnabled}
            onTick={(sec) => {
              timersRef.current.white = sec;
              persistSession();
            }}
            onTimeout={() => handleTimeout(playerRef.current)}
            label={playerRef.current === "white" ? "White" : "Black"}
          />
          <Timer
            key={`black-${gameIDRef.current ?? timerResetRef.current}`}
            initialSeconds={timerSeconds}
            initialRemaining={timersRef.current.black ?? undefined}
            isActive={
              currentTurnRef.current !== playerRef.current &&
              gameState === "ongoing" &&
              gameStartRef.current
            }
            isGameOver={gameState !== "ongoing"}
            increment={timerIncrement}
            countUp={!timerEnabled}
            onTick={(sec) => {
              timersRef.current.black = sec;
              persistSession();
            }}
            onTimeout={() =>
              handleTimeout(playerRef.current === "white" ? "black" : "white")
            }
            label={playerRef.current === "white" ? "Black" : "White"}
          />
        </div>
      </div>
      {/* Game config and game over modals */}
      {!gameConfig && !restoring && (
        <GameSetupModal
          onStart={handleModalStart}
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
