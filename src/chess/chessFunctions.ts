import type {
  Player,
  Color,
  ChessBoard,
  PieceType,
  Piece,
  Square,
} from "./chessTypes";

//Stable identity for pieces. Good in general but helps with sliding animations between
//squares via layoutId. Ids are regenerated whenever a board is freshly built, which
//is what prevents a refresh/restore from replaying old moves.
let pieceCounter = 0;
export function generatePieceId(): string {
  pieceCounter++;
  return `p-${pieceCounter}-${Math.random().toString(36).slice(2, 9)}`;
}

function makePiece(type: PieceType, color: Color): Piece {
  return {
    id: generatePieceId(),
    type,
    color,
    turnCount: 0,
    moved: false,
  };
}

//TODO profiles
export function createPlayer(color: Color): Player {
  return {
    color,
    //TODO: Either keep or remove, id is player's id such as name or unique identifier.
    id: null,
    //White is always first
    isTurn: color === "white" ? true : false,
  };
}

const chessFiles = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function createEmptyBoard(): ChessBoard {
  const chessboard: ChessBoard = [];

  for (let row = 0; row < 8; row++) {
    const currentRow = [];

    for (let col = 0; col < 8; col++) {
      currentRow.push({
        row,
        col,
        squarePiece: null,
        darkTile: (row + col) % 2 === 1,
        isTopLeft: row === 0 && col === 0 ? true : false,
        isTopRight: row === 0 && col === 7 ? true : false,
        isBottomLeft: row === 7 && col === 0 ? true : false,
        isBottomRight: row === 7 && col === 7 ? true : false,
        coordinate: `${chessFiles[col]}${8 - row}`,
      });
    }

    chessboard.push(currentRow);
  }

  return chessboard;
}

export function populateBoard(chessboard: ChessBoard): ChessBoard {
  return chessboard.map((row, rowi) => {
    return row.map((square, coli) => {
      square.squarePiece = null;
      square.highlighted = false;
      square.selected = false;
      square.enPassant = false;

      //Black Pawn
      if (rowi === 1) {
        square.squarePiece = makePiece("pawn", "black");
      }

      //White Pawn
      if (rowi === 6) {
        square.squarePiece = makePiece("pawn", "white");
      }

      //Black Rook
      if ((rowi === 0 && coli === 0) || (rowi === 0 && coli === 7)) {
        square.squarePiece = makePiece("rook", "black");
      }

      //White Rook
      if ((rowi === 7 && coli === 0) || (rowi === 7 && coli === 7)) {
        square.squarePiece = makePiece("rook", "white");
      }

      //Black Knight
      if ((rowi === 0 && coli === 1) || (rowi === 0 && coli === 6)) {
        square.squarePiece = makePiece("knight", "black");
      }

      //White Knight
      if ((rowi === 7 && coli === 1) || (rowi === 7 && coli === 6)) {
        square.squarePiece = makePiece("knight", "white");
      }

      //Black Bishop
      if ((rowi === 0 && coli === 2) || (rowi === 0 && coli === 5)) {
        square.squarePiece = makePiece("bishop", "black");
      }

      //White bishop
      if ((rowi === 7 && coli === 2) || (rowi === 7 && coli === 5)) {
        square.squarePiece = makePiece("bishop", "white");
      }

      //Black Queen
      if (rowi === 0 && coli === 3) {
        square.squarePiece = makePiece("queen", "black");
      }

      //White Queen
      if (rowi === 7 && coli === 3) {
        square.squarePiece = makePiece("queen", "white");
      }

      //Black King
      if (rowi === 0 && coli === 4) {
        square.squarePiece = makePiece("king", "black");
      }

      //White King
      if (rowi === 7 && coli === 4) {
        square.squarePiece = makePiece("king", "white");
      }

      return {
        ...square,
      };
    });
  });
}

export function coordinates(board: ChessBoard): void {
  const files: Record<number, string> = {
    0: "a",
    1: "b",
    2: "c",
    3: "d",
    4: "e",
    5: "f",
    6: "g",
    7: "h",
  };
  board.flat().forEach((square) => {
    const num = square.col;
    const file = files[num];
    const coord = file + (8 - square.row);
    square.coordinate = coord;
  });
}

export function fenFormat(board: ChessBoard): string {
  const fen: string[] = [];
  board.forEach((rank) => {
    let row = "";
    let empty = 0;
    const map = {
      king: "k",
      queen: "q",
      rook: "r",
      bishop: "b",
      knight: "n",
      pawn: "p",
    };

    rank.forEach((square) => {
      if (square.squarePiece === null) {
        empty++;
      } else {
        if (empty > 0) {
          row += empty;
          empty = 0;
        }
        const pieceSymbol = map[square.squarePiece.type];
        if (square.squarePiece.color === "white") {
          row += pieceSymbol.toUpperCase();
        } else {
          row += pieceSymbol;
        }
      }
    });
    if (empty > 0) {
      row += empty;
    }
    fen.push(row);
  });
  const fenJoin = fen.join("/");
  return fenJoin;
}

export function completeFEN(
  board: ChessBoard,
  fen: string,
  playerTurn: string,
  halfClock: number,
  turns: number,
  enPassant?: string | undefined,
): string {
  let fenComplete: string = fen;
  fenComplete += " ";
  fenComplete += playerTurn[0];
  fenComplete += " ";
  const blackQueenRook = board[0][0];
  const blackKing = board[0][4];
  const blackKingRook = board[0][7];
  const whiteQueenRook = board[7][0];
  const whiteKing = board[7][4];
  const whiteKingRook = board[7][7];
  let blackQueenCastle = false;
  let blackKingCastle = false;
  let whiteQueenCastle = false;
  let whiteKingCastle = false;

  if (
    blackQueenRook.squarePiece?.type === "rook" &&
    blackKing.squarePiece?.type === "king"
  ) {
    if (!blackQueenRook.squarePiece.moved && !blackKing.squarePiece?.moved) {
      blackQueenCastle = true;
    }
  }

  if (
    blackKingRook.squarePiece?.type === "rook" &&
    blackKing.squarePiece?.type === "king"
  ) {
    if (!blackKingRook.squarePiece.moved && !blackKing.squarePiece?.moved) {
      blackKingCastle = true;
    }
  }

  if (
    whiteQueenRook.squarePiece?.type === "rook" &&
    whiteKing.squarePiece?.type === "king"
  ) {
    if (!whiteQueenRook.squarePiece.moved && !whiteKing.squarePiece?.moved) {
      whiteQueenCastle = true;
    }
  }

  if (
    whiteKingRook.squarePiece?.type === "rook" &&
    whiteKing.squarePiece?.type === "king"
  ) {
    if (!whiteKingRook.squarePiece.moved && !whiteKing.squarePiece?.moved) {
      whiteKingCastle = true;
    }
  }

  if (
    !blackQueenCastle &&
    !blackKingCastle &&
    !whiteQueenCastle &&
    !whiteKingCastle
  ) {
    fenComplete += "- ";
  } else {
    if (whiteKingCastle) {
      fenComplete += "K";
    }
    if (whiteQueenCastle) {
      fenComplete += "Q";
    }
    if (blackKingCastle) {
      fenComplete += "k";
    }
    if (blackQueenCastle) {
      fenComplete += "q";
    }

    fenComplete += " ";
  }

  // board.flat().forEach((square) => {
  //   if(square.enPassant)
  // })

  let enPassantAvailable = false;

  if (enPassant) {
    fenComplete += enPassant;
    enPassantAvailable = true;
  }

  if (!enPassantAvailable) fenComplete += "-";
  fenComplete += " ";

  fenComplete += halfClock + " ";
  fenComplete += turns;

  return fenComplete;
}

//Function to take FEN string and update board based on it.
export function applyFenToBoard(
  fen: string,
  board: ChessBoard,
  //preserveIds reuses the ids of existing pieces where possible. Good in general but mainly used for framer-motion
  preserveIds = false, //False on initial building to prevent replay transitions on refresh/reconnect
): void {
  const pieceMap: Record<string, { type: PieceType; color: Color }> = {
    p: { type: "pawn", color: "black" },
    r: { type: "rook", color: "black" },
    n: { type: "knight", color: "black" },
    b: { type: "bishop", color: "black" },
    q: { type: "queen", color: "black" },
    k: { type: "king", color: "black" },
    P: { type: "pawn", color: "white" },
    R: { type: "rook", color: "white" },
    N: { type: "knight", color: "white" },
    B: { type: "bishop", color: "white" },
    Q: { type: "queen", color: "white" },
    K: { type: "king", color: "white" },
  };

  //Snapshot the current pieces so their ids can be reused across live syncs.
  const oldPieces: { coord: string; piece: Piece }[] = [];
  board.flat().forEach((sqr) => {
    if (sqr.squarePiece) {
      oldPieces.push({ coord: sqr.coordinate, piece: sqr.squarePiece });
    }
  });

  const [position, , castling, enPassantSquare] = fen.split(" ");
  const ranks = position.split("/");

  //Parse the target layout once so we can tell which old pieces "moved away"
  //from their current square (they no longer appear there in the new fen).
  const newLayout: { coord: string; type: PieceType; color: Color }[] = [];
  ranks.forEach((rank, rowIndex) => {
    let colIndex = 0;
    for (const char of rank) {
      if (!isNaN(parseInt(char))) {
        colIndex += parseInt(char);
      } else {
        const piece = pieceMap[char];
        if (piece) {
          newLayout.push({
            coord: `${chessFiles[colIndex]}${8 - rowIndex}`,
            type: piece.type,
            color: piece.color,
          });
        }
        colIndex++;
      }
    }
  });

  const used = new Set<Piece>();
  const reuseId = (
    piece: { type: PieceType; color: Color },
    coord: string,
  ): string => {
    //Same square, same type + color: stationary piece, keep its id
    const stationary = oldPieces.find(
      (o) =>
        o.coord === coord &&
        o.piece.type === piece.type &&
        o.piece.color === piece.color &&
        !used.has(o.piece),
    );
    if (stationary) {
      used.add(stationary.piece);
      return stationary.piece.id;
    }

    //Piece that moved here finds an unused old piece of the same type +
    //color whose original square no longer holds an identical piece.
    const moved = oldPieces.find(
      (o) =>
        o.piece.type === piece.type &&
        o.piece.color === piece.color &&
        !used.has(o.piece) &&
        !newLayout.some(
          (n) =>
            n.coord === o.coord &&
            n.type === o.piece.type &&
            n.color === o.piece.color,
        ),
    );
    if (moved) {
      used.add(moved.piece);
      return moved.piece.id;
    }

    //Get fresh id assigned
    return generatePieceId();
  };

  board.flat().forEach((sqr) => {
    sqr.enPassant = false;
    sqr.enPassantTake = false;
    sqr.squarePiece = null;
  });

  ranks.forEach((rank, rowIndex) => {
    let colIndex = 0;
    for (const char of rank) {
      if (!isNaN(parseInt(char))) {
        //Number means empty squares
        const emptyCount = parseInt(char);
        for (let i = 0; i < emptyCount; i++) {
          board[rowIndex][colIndex].squarePiece = null;
          colIndex++;
        }
      } else {
        const piece = pieceMap[char];
        if (piece) {
          const coord = `${chessFiles[colIndex]}${8 - rowIndex}`;
          //Determine moved status from castling field
          const moved = determineMoved(rowIndex, colIndex, char, castling);
          board[rowIndex][colIndex].squarePiece = {
            ...piece,
            id: preserveIds ? reuseId(piece, coord) : generatePieceId(),
            moved,
            turnCount: 0,
          };
        }
        colIndex++;
      }
    }
  });

  //If enpassant in fen is not a dash, it means enpassant opportunity is available to opponent
  if (enPassantSquare !== "-") {
    board.flat().forEach((sqr) => {
      if (sqr.coordinate === enPassantSquare) {
        //Mark same coordinate tile as eligible to take
        sqr.enPassantTake = true;
        //If row of the tile where en passant is possible is 2, it's a black piece, so enpassant must be set valid in the square in row 3. Otherwise white pawn moved and must be set in row 4 square
        const pawnRow = sqr.row === 2 ? 3 : 4;
        board[pawnRow][sqr.col].enPassant = true;
      }
    });
  }
}

//Parse moves
function determineMoved(
  row: number,
  col: number,
  piece: string,
  castling: string,
): boolean {
  //White king on e1
  if (piece === "K" && row === 7 && col === 4)
    return !castling.includes("K") && !castling.includes("Q");
  //Black king on e8
  if (piece === "k" && row === 0 && col === 4)
    return !castling.includes("k") && !castling.includes("q");
  //White kingside rook
  if (piece === "R" && row === 7 && col === 7) return !castling.includes("K");
  //White queenside rook
  if (piece === "R" && row === 7 && col === 0) return !castling.includes("Q");
  //Black kingside rook
  if (piece === "r" && row === 0 && col === 7) return !castling.includes("k");
  //Black queenside rook
  if (piece === "r" && row === 0 && col === 0) return !castling.includes("q");
  //Pawns on starting rank haven't moved
  if (piece === "P" && row === 6) return false;
  if (piece === "p" && row === 1) return false;
  //Everything else has moved
  return true;
}

export function getTurn(fen: string): number {
  const items = fen.split(" ");
  return parseInt(items[items.length - 1]);
}

//Pieces a pawn can be promoted to. The player picks one when a pawn reaches the
//final rank instead of auto upgrading to a queen.
export type PromotionType = "queen" | "rook" | "bishop" | "knight";

//Rank a pawn promotes on: white pushes to row 0, black to row 7
const promotionRank: Record<Color, number> = { white: 0, black: 7 };

//Returns the square holding a pawn of the given color on its promotion rank,
//or null if there isn't one. Used to decide when to show the promotion modal.
export function findPawnNeedingPromotion(
  color: Color,
  board: ChessBoard,
): Square | null {
  return (
    board.flat().find((sqr) => {
      const piece = sqr.squarePiece;
      return (
        sqr.row === promotionRank[color] &&
        piece?.type === "pawn" &&
        piece.color === color
      );
    }) ?? null
  );
}

//Promotes the pawn on the given square to the chosen piece type.
export function promotePawn(square: Square, type: PromotionType): void {
  if (square.squarePiece) {
    square.squarePiece.type = type;
  }
}
