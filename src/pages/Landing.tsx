//TODO: Choose piece to rank up when pawn hits final row. Right now just auto upgrades to queen.
//TODO: Draggable pieces & animation on movement
//TODO: Once everything is done, add extra mechanics to truly be unique.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChessPawn,
  ChessRook,
  ChessKnight,
  ChessBishop,
  ChessQueen,
  ChessKing,
} from "lucide-react";

const Landing = () => {
  const openingIndexRef = useRef<number | null>(null);
  const generationRef = useRef(0);
  const navigate = useNavigate();

  type Piece = {
    id: string;
    icon: React.ElementType;
    color: string;
    square: number; //0-63
  };

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  function algebraicToIndex(square: string): number {
    const file = files.indexOf(square[0]);
    const rank = Number(square[1]);
    const row = 8 - rank;
    return row * 8 + file;
  }

  function parseMove(move: string): [number, number] {
    return [
      algebraicToIndex(move.slice(0, 2)),
      algebraicToIndex(move.slice(2, 4)),
    ];
  }

  const backRank: { name: string; icon: React.ElementType }[] = [
    { name: "rook", icon: ChessRook },
    { name: "knight", icon: ChessKnight },
    { name: "bishop", icon: ChessBishop },
    { name: "queen", icon: ChessQueen },
    { name: "king", icon: ChessKing },
    { name: "bishop", icon: ChessBishop },
    { name: "knight", icon: ChessKnight },
    { name: "rook", icon: ChessRook },
  ];

  function initialPieces(): Piece[] {
    const pieces: Piece[] = [];

    backRank.forEach(({ name, icon }, file) => {
      pieces.push({
        id: `black-${name}-${file}`,
        icon,
        color: "text-black",
        square: file,
      });
      pieces.push({
        id: `white-${name}-${file}`,
        icon,
        color: "text-white",
        square: 56 + file,
      });
    });

    for (let file = 0; file < 8; file++) {
      pieces.push({
        id: `black-pawn-${file}`,
        icon: ChessPawn,
        color: "text-black",
        square: 8 + file,
      });
      pieces.push({
        id: `white-pawn-${file}`,
        icon: ChessPawn,
        color: "text-white",
        square: 48 + file,
      });
    }

    return pieces;
  }

  const openings: string[][] = [
    //Italian
    [
      "e2e4",
      "e7e5",
      "g1f3",
      "b8c6",
      "f1c4",
      "f8c5",
      "c2c3",
      "g8f6",
      "d2d4",
      "e5d4",
    ],

    //Ruy Lopez Exchange
    [
      "e2e4",
      "e7e5",
      "g1f3",
      "b8c6",
      "f1b5",
      "a7a6",
      "b5c6",
      "d7c6",
      "b1c3",
      "g8e7",
    ],

    //Queen's Gambit Accepted
    [
      "d2d4",
      "d7d5",
      "c2c4",
      "d5c4",
      "g1f3",
      "g8f6",
      "e2e3",
      "e7e6",
      "f1c4",
      "c7c5",
    ],

    //Najdorf Sicilian
    [
      "e2e4",
      "c7c5",
      "g1f3",
      "d7d6",
      "d2d4",
      "c5d4",
      "f3d4",
      "g8f6",
      "b1c3",
      "a7a6",
    ],

    //Scotch
    [
      "e2e4",
      "e7e5",
      "g1f3",
      "b8c6",
      "d2d4",
      "e5d4",
      "f3d4",
      "g8f6",
      "b1c3",
      "f8b4",
    ],
  ];

  const [board, setBoard] = useState<Piece[]>(initialPieces);

  function makeMove(from: number, to: number) {
    setBoard((prev) => {
      const withoutCaptured = prev.filter((p) => p.square !== to);
      //Move piece
      return withoutCaptured.map((p) =>
        p.square === from ? { ...p, square: to } : p,
      );
    });
  }

  function resetBoard() {
    setBoard(initialPieces());
  }

  //A setTimeout wrapper that can be paused and resumed without losing track of how much delay is left.
  //Need this due to a bug where tabbing out causes moves to keep going on the board, and the animation will 'catch up' simultaneously
  //Still bugs sometimes but spent enough time on this and mostly works now
  //TODO: Find a complete fix, but for now is very much passable
  function createPausableTimer(callback: () => void, delay: number) {
    let remaining = delay;
    let startedAt = Date.now();
    let timerId: ReturnType<typeof setTimeout> | null = setTimeout(
      callback,
      delay,
    );

    return {
      pause() {
        if (timerId === null) return; //paused
        clearTimeout(timerId);
        timerId = null;
        remaining -= Date.now() - startedAt;
        remaining = Math.max(remaining, 0);
      },
      resume() {
        if (timerId !== null) return; //running
        startedAt = Date.now();
        timerId = setTimeout(callback, remaining);
      },
      clear() {
        if (timerId !== null) clearTimeout(timerId);
        timerId = null;
      },
    };
  }

  //Randomly picks an opening, makes sure it's unique from the past 3 selected
  function pickNextOpeningIndex(): number {
    if (openings.length === 1) return 0;
    let idx: number;
    do {
      idx = Math.floor(Math.random() * openings.length);
    } while (idx === openingIndexRef.current);
    return idx;
  }

  //Useeffect for chsesboard animation
  useEffect(() => {
    generationRef.current += 1;
    const myGeneration = generationRef.current;
    const isStale = () => myGeneration !== generationRef.current;

    let currentTimer: ReturnType<typeof createPausableTimer> | null = null;

    function schedule(fn: () => void, delay: number) {
      currentTimer = createPausableTimer(() => {
        if (!isStale()) fn();
      }, delay);
    }

    function playOpening() {
      if (isStale()) return;

      const opening = openings[pickNextOpeningIndex()];
      let moveIndex = 0;

      function nextMove() {
        if (isStale()) return;

        if (moveIndex >= opening.length) {
          schedule(() => {
            if (isStale()) return;
            resetBoard();
            schedule(() => {
              if (!isStale()) playOpening();
            }, 2500);
          }, 2000);
          return;
        }

        const [from, to] = parseMove(opening[moveIndex]);
        makeMove(from, to);
        moveIndex++;

        schedule(nextMove, 1800);
      }

      nextMove();
    }

    schedule(playOpening, 0);

    function handleVisibilityChange() {
      if (!currentTimer) return;
      if (document.hidden) {
        currentTimer.pause();
      } else {
        currentTimer.resume();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      currentTimer?.clear();
    };
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen gap-4 md:flex-row">
        <div className="w-full max-w-[min(80vw,70vh,28rem)] md:max-w-[min(38vw,70vh,28rem)]">
          {/**Board */}
          <div className="relative grid grid-cols-8 auto-rows-fr aspect-square w-full border border-[#16171d] md:ml-6">
            {Array.from({ length: 64 }, (_, i) => {
              const isLight = (Math.floor(i / 8) + (i % 8)) % 2 === 0;
              return (
                <div
                  key={i}
                  className={`
            ${isLight ? "bg-gray-500" : "bg-gray-800"}`}
                ></div>
              );
            })}

            {/* Animation using motion library for chess openings */}
            <AnimatePresence>
              {board.map((piece) => {
                const row = Math.floor(piece.square / 8);
                const col = piece.square % 8;

                return (
                  <motion.div
                    key={piece.id}
                    className="absolute top-0 left-0 w-[12.5%] h-[12.5%] flex items-center justify-center"
                    initial={false}
                    animate={{
                      x: `${col * 100}%`,
                      y: `${row * 100}%`,
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      x: { duration: 0.7, ease: "easeInOut" },
                      y: { duration: 0.7, ease: "easeInOut" },
                      default: { duration: 0.3, ease: "easeOut" },
                    }}
                  >
                    <piece.icon
                      size={36}
                      strokeWidth={2.5}
                      className={`${piece.color} drop-shadow w-3/4 h-3/4`}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Text & Button */}
        <div className="homepage-item min-w-0 text-xl md:text-3xl lg:text-5xl text-center">
          <h1 className="mb-10 ml-4 -mr-4">Chess Versus</h1>
          <p className="mb-10 ml-4 -mr-4 text-base">
            Play chess locally, against AI, or online with a friend.
          </p>
          <p className="mb-5 ml-4 -mr-4 -mt-5 text-xs pr-7 text-gray-500">
            Chess Versus is a free-to-play educational project with elements
            inspired by popular chess websites without ripping assets.
          </p>
          <button
            className="px-8 py-4 ml-4 -mr-4 pl-20 pr-20 l-2 rounded-xl bg-white text-zinc-900 font-semibold text-base
                hover:bg-gray-200 active:scale-95 transition-all duration-150 shadow-lg shadow-black/30
                select-none cursor-pointer"
            onClick={() => navigate("/game")}
          >
            Start a Game
          </button>
        </div>
      </div>
    </>
  );
};

export default Landing;
