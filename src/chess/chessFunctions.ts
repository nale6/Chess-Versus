import type { Player, Color, ChessBoard, Piece } from "./chessTypes";

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

//   const darkTile = (row + col) % 2 === 1;
//   const isTopLeft = row === 0 && col === 0 ? true : false;
//   const isTopRight = row === 0 && col === 7 ? true : false;
//   const isBottomLeft = row === 7 && col === 0 ? true : false;
//   const isBottomRight = row === 7 && col === 7 ? true : false;

export function populateBoard(chessboard: ChessBoard): ChessBoard {
  return chessboard.map((row, rowi) => {
    return row.map((square, coli) => {
      let piece: Piece | null = square.squarePiece;

      //Black Pawn
      if (rowi === 1) {
        square.squarePiece = {
          type: "pawn",
          color: "black",
          turnCount: 0,
        };
      }

      //White Pawn
      if (rowi === 6) {
        square.squarePiece = {
          type: "pawn",
          color: "white",
          turnCount: 0,
        };
      }

      //Black Rook
      if ((rowi === 0 && coli === 0) || (rowi === 0 && coli === 7)) {
        square.squarePiece = {
          type: "rook",
          color: "black",
          turnCount: 0,
        };
      }

      //White Rook
      if ((rowi === 7 && coli === 0) || (rowi === 7 && coli === 7)) {
        square.squarePiece = {
          type: "rook",
          color: "white",
          turnCount: 0,
        };
      }

      //Black Knight
      if ((rowi === 0 && coli === 1) || (rowi === 0 && coli === 6)) {
        square.squarePiece = {
          type: "knight",
          color: "black",
          turnCount: 0,
        };
      }

      //White Knight
      if ((rowi === 7 && coli === 1) || (rowi === 7 && coli === 6)) {
        square.squarePiece = {
          type: "knight",
          color: "white",
          turnCount: 0,
        };
      }

      //Black Bishop
      if ((rowi === 0 && coli === 2) || (rowi === 0 && coli === 5)) {
        square.squarePiece = {
          type: "bishop",
          color: "black",
          turnCount: 0,
        };
      }

      //White bishop
      if ((rowi === 7 && coli === 2) || (rowi === 7 && coli === 5)) {
        square.squarePiece = {
          type: "bishop",
          color: "white",
          turnCount: 0,
        };
      }

      //Black Queen
      if (rowi === 0 && coli === 3) {
        square.squarePiece = {
          type: "queen",
          color: "black",
          turnCount: 0,
        };
      }

      //White Queen
      if (rowi === 7 && coli === 3) {
        square.squarePiece = {
          type: "queen",
          color: "white",
          turnCount: 0,
        };
      }

      //Black King
      if (rowi === 0 && coli === 4) {
        square.squarePiece = {
          type: "king",
          color: "black",
          turnCount: 0,
        };
      }

      //White King
      if (rowi === 7 && coli === 4) {
        square.squarePiece = {
          type: "king",
          color: "white",
          turnCount: 0,
        };
      }

      return {
        ...square,
        piece,
      };
    });
  });
}
