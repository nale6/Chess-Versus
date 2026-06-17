import type { Player, Color, ChessBoard } from "./chessTypes";

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
        square.squarePiece = {
          type: "pawn",
          color: "black",
          turnCount: 0,
          moved: false,
        };
      }

      //White Pawn
      if (rowi === 6) {
        square.squarePiece = {
          type: "pawn",
          color: "white",
          turnCount: 0,
          moved: false,
        };
      }

      //Black Rook
      if ((rowi === 0 && coli === 0) || (rowi === 0 && coli === 7)) {
        square.squarePiece = {
          type: "rook",
          color: "black",
          turnCount: 0,
          moved: false,
        };
      }

      //White Rook
      if ((rowi === 7 && coli === 0) || (rowi === 7 && coli === 7)) {
        square.squarePiece = {
          type: "rook",
          color: "white",
          turnCount: 0,
          moved: false,
        };
      }

      //Black Knight
      if ((rowi === 0 && coli === 1) || (rowi === 0 && coli === 6)) {
        square.squarePiece = {
          type: "knight",
          color: "black",
          turnCount: 0,
          moved: false,
        };
      }

      //White Knight
      if ((rowi === 7 && coli === 1) || (rowi === 7 && coli === 6)) {
        square.squarePiece = {
          type: "knight",
          color: "white",
          turnCount: 0,
          moved: false,
        };
      }

      //Black Bishop
      if ((rowi === 0 && coli === 2) || (rowi === 0 && coli === 5)) {
        square.squarePiece = {
          type: "bishop",
          color: "black",
          turnCount: 0,
          moved: false,
        };
      }

      //White bishop
      if ((rowi === 7 && coli === 2) || (rowi === 7 && coli === 5)) {
        square.squarePiece = {
          type: "bishop",
          color: "white",
          turnCount: 0,
          moved: false,
        };
      }

      //Black Queen
      if (rowi === 0 && coli === 3) {
        square.squarePiece = {
          type: "queen",
          color: "black",
          turnCount: 0,
          moved: false,
        };
      }

      //White Queen
      if (rowi === 7 && coli === 3) {
        square.squarePiece = {
          type: "queen",
          color: "white",
          turnCount: 0,
          moved: false,
        };
      }

      //Black King
      if (rowi === 0 && coli === 4) {
        square.squarePiece = {
          type: "king",
          color: "black",
          turnCount: 0,
          moved: false,
        };
      }

      //White King
      if (rowi === 7 && coli === 4) {
        square.squarePiece = {
          type: "king",
          color: "white",
          turnCount: 0,
          moved: false,
        };
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
  // board.flat().forEach((square) => {
  //   console.log(square.coordinate);
  // });
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

//TODO player turns with player obj
//TODO timer
//TODO undo after backend or code it and test using local storage
//TODO: Surrender, ask for draw
