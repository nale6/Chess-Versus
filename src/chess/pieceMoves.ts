import { useState } from "react";
import type { Piece, Move, Square, ChessBoard } from "./chessTypes";

//TODO fix bug, if pawn hasnt moved and theres piece in front of it directly, it can still move to the 2nd square.
//TODO when pawn reaches end, can upgrade piece to knight, bishop, rook or queen
export function pawnMoves(
  piece: Piece,
  square: Square,
  chessboard: ChessBoard,
): Move[] {
  const move: Move[] = [];
  //Move up or down based on piece color
  const direction = piece.color === "white" ? -1 : 1;
  //Add direction value to row to go up or down
  const nextRow = square.row + direction;
  //Pawns in the first move can optionally move 2 instead of 1
  const nextRowNoMove = square.row + direction * 2;
  //Pawns stay in same column unless they can take or en passant rule applies (check if that's what it's called)
  const column = square.col;

  if (nextRow >= 0 && nextRow < 8) {
    if (chessboard[nextRow][column].squarePiece === null) {
      move.push({ row: nextRow, col: column });
    }
  }
  if (!piece.moved) {
    move.push({ row: nextRowNoMove, col: column });
  }
  if (column - 1 >= 0) {
    if (
      chessboard[nextRow][column - 1].squarePiece &&
      piece.color !== chessboard[nextRow][column - 1].squarePiece?.color
    ) {
      move.push({ row: nextRow, col: column - 1 });
    }
  }
  if (column + 1 < 8) {
    if (
      chessboard[nextRow][column + 1].squarePiece &&
      piece.color !== chessboard[nextRow][column + 1].squarePiece?.color
    ) {
      move.push({ row: nextRow, col: column + 1 });
    }
  }

  return move;
}

//TODO code castling
export function rookMoves(
  piece: Piece,
  square: Square,
  chessboard: ChessBoard,
): Move[] {
  const move: Move[] = [];
  const direction = piece.color === "white" ? -1 : 1;
  //White POV vvv Reverse for 2nd player
  let cardinalN = true;
  let cardinalS = true;
  let cardinalW = true;
  let cardinalE = true;
  let nextRow = square.row;
  let revRow = square.row;
  let westCol = square.col;
  let eastCol = square.col;
  let column = square.col;

  while (cardinalN) {
    if (piece.color === "white" && nextRow === 0) {
      cardinalN = false;
      break;
    } else if (piece.color === "black" && nextRow == 7) {
      cardinalN = false;
      break;
    }
    if (chessboard[nextRow + direction][column].squarePiece) {
      cardinalN = false;
    }
    if (
      nextRow + direction >= 0 &&
      nextRow + direction < 8 &&
      chessboard[nextRow + direction][column].squarePiece?.color !== piece.color
    ) {
      move.push({ row: nextRow + direction, col: column });
      nextRow = nextRow + direction;
    } else {
      cardinalN = false;
    }
  }
  while (cardinalS) {
    if (piece.color === "white" && revRow === 7) {
      cardinalS = false;
      break;
    } else if (piece.color === "black" && revRow === 0) {
      cardinalS = false;
      break;
    }
    if (chessboard[revRow - direction][column].squarePiece) {
      cardinalS = false;
    }
    if (
      revRow - direction >= 0 &&
      revRow - direction < 8 &&
      chessboard[revRow - direction][column].squarePiece?.color !== piece.color
    ) {
      move.push({ row: revRow - direction, col: column });
      revRow = revRow - direction;
    } else {
      cardinalS = false;
    }
  }
  while (cardinalW) {
    if (westCol === 0) {
      cardinalW = false;
      break;
    }
    if (chessboard[square.row][westCol - 1].squarePiece) {
      cardinalW = false;
    }
    if (
      chessboard[square.row][westCol - 1].squarePiece?.color !== piece.color
    ) {
      move.push({ row: square.row, col: westCol - 1 });
      westCol = westCol - 1;
    } else {
      cardinalW = false;
    }
  }
  while (cardinalE) {
    if (eastCol === 7) {
      cardinalE = false;
      break;
    }
    if (chessboard[square.row][eastCol + 1].squarePiece) {
      cardinalE = false;
    }
    if (
      chessboard[square.row][eastCol + 1].squarePiece?.color !== piece.color
    ) {
      move.push({ row: square.row, col: eastCol + 1 });
      eastCol = eastCol + 1;
    } else {
      cardinalE = false;
    }
  }
  return move;
}

export function bishopMoves(
  piece: Piece,
  square: Square,
  chessboard: ChessBoard,
): Move[] {
  const move: Move[] = [];
  let northW = true;
  let northE = true;
  let southW = true;
  let southE = true;
  let nextRow = square.row;
  let nextColumn = square.col;
  if (nextRow === 7) {
    southW = false;
    southE = false;
  }
  if (nextRow === 0) {
    northW = false;
    northE = false;
  }
  if (nextColumn === 0) {
    northW = false;
    southW = false;
  }
  if (nextColumn === 7) {
    northE = false;
    southE = false;
  }
  while (northW) {
    // if (nextRow === 0 || nextColumn === 0) {
    //   northW = false;
    //   break;
    // }
    if (nextRow - 1 === 0 || nextColumn - 1 === 0) {
      northW = false;
    }
    if (!chessboard[nextRow - 1][nextColumn - 1].squarePiece) {
      move.push({ row: nextRow - 1, col: nextColumn - 1 });
    } else if (chessboard[nextRow - 1][nextColumn - 1].squarePiece) {
      if (
        piece.color ===
        chessboard[nextRow - 1][nextColumn - 1].squarePiece!.color
      ) {
        northW = false;
      } else {
        move.push({ row: nextRow - 1, col: nextColumn - 1 });
        northW = false;
      }
    }
    nextRow--;
    nextColumn--;
  }
  // vvvvv Without resetting nextrow and nextcolumn this code makes it bounce from the left board, potential later mechanic
  nextRow = square.row;
  nextColumn = square.col;
  while (northE) {
    // if (nextColumn === 7 || nextRow === 0) {
    //   northE = false;
    //   break;
    // }
    if (nextColumn + 1 === 7 || nextRow - 1 === 0) {
      northE = false;
    }

    if (!chessboard[nextRow - 1][nextColumn + 1].squarePiece) {
      move.push({ row: nextRow - 1, col: nextColumn + 1 });
    } else if (chessboard[nextRow - 1][nextColumn + 1].squarePiece) {
      if (
        piece.color ===
        chessboard[nextRow - 1][nextColumn + 1].squarePiece!.color
      ) {
        northE = false;
      } else {
        move.push({ row: nextRow - 1, col: nextColumn + 1 });
        northE = false;
      }
    }
    nextRow--;
    nextColumn++;
  }
  nextRow = square.row;
  nextColumn = square.col;
  while (southW) {
    // if (nextColumn === 0 || nextRow === 7) {
    //   southW = false;
    // }
    if (nextColumn - 1 === 0 || nextRow + 1 === 7) {
      southW = false;
    }
    if (!chessboard[nextRow + 1][nextColumn - 1].squarePiece) {
      move.push({ row: nextRow + 1, col: nextColumn - 1 });
    } else if (chessboard[nextRow + 1][nextColumn - 1].squarePiece) {
      if (
        piece.color ===
        chessboard[nextRow + 1][nextColumn - 1].squarePiece!.color
      ) {
        southW = false;
      } else {
        move.push({ row: nextRow + 1, col: nextColumn - 1 });
        southW = false;
      }
    }
    nextRow++;
    nextColumn--;
  }
  nextRow = square.row;
  nextColumn = square.col;
  while (southE) {
    // if (nextColumn === 7 || nextRow === 7) {
    //   southE = false;
    //   break;
    // }
    if (nextColumn + 1 === 7 || nextRow + 1 === 7) {
      southE = false;
    }
    if (!chessboard[nextRow + 1][nextColumn + 1].squarePiece) {
      move.push({ row: nextRow + 1, col: nextColumn + 1 });
    } else if (chessboard[nextRow + 1][nextColumn + 1].squarePiece) {
      if (
        piece.color ===
        chessboard[nextRow + 1][nextColumn + 1].squarePiece!.color
      ) {
        southE = false;
      } else {
        move.push({ row: nextRow + 1, col: nextColumn + 1 });
        southE = false;
      }
    }
    nextRow++;
    nextColumn++;
  }
  return move;
}

export function queenMoves(
  piece: Piece,
  square: Square,
  chessboard: ChessBoard,
): Move[] {
  const rookMove = rookMoves(piece, square, chessboard);
  const bishopMove = bishopMoves(piece, square, chessboard);
  const move: Move[] = [];
  rookMove.forEach((moves) => {
    move.push(moves);
  });
  bishopMove.forEach((moves) => {
    move.push(moves);
  });
  return move;
}

//TODO: Code part of legal moves where king CANNOT move or take piece if it will be captured
export function kingMoves(
  piece: Piece,
  square: Square,
  chessboard: ChessBoard,
): Move[] {
  const move: Move[] = [];

  let n = true;
  let s = true;
  let w = true;
  let e = true;
  let nextRow = square.row;
  let nextCol = square.col;

  if (nextRow === 7) {
    s = false;
  }
  if (nextRow === 0) {
    n = false;
  }
  if (nextCol === 0) {
    w = false;
  }
  if (nextCol === 7) {
    e = false;
  }
  let ne = true;
  let nw = true;
  let se = true;
  let sw = true;
  if (!n || !e) {
    ne = false;
  }
  if (!n || !w) {
    nw = false;
  }
  if (!s || !e) {
    se = false;
  }
  if (!s || !w) {
    sw = false;
  }
  if (
    n &&
    chessboard[nextRow - 1][nextCol].squarePiece?.color !== piece.color
  ) {
    move.push({ row: nextRow - 1, col: nextCol });
  }
  if (
    s &&
    chessboard[nextRow + 1][nextCol].squarePiece?.color !== piece.color
  ) {
    move.push({ row: nextRow + 1, col: nextCol });
  }
  if (
    w &&
    chessboard[nextRow][nextCol - 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: nextRow, col: nextCol - 1 });
  }
  if (
    e &&
    chessboard[nextRow][nextCol + 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: nextRow, col: nextCol + 1 });
  }
  if (
    nw &&
    chessboard[nextRow - 1][nextCol - 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: nextRow - 1, col: nextCol - 1 });
  }
  if (
    ne &&
    chessboard[nextRow - 1][nextCol + 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: nextRow - 1, col: nextCol + 1 });
  }
  if (
    sw &&
    chessboard[nextRow + 1][nextCol - 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: nextRow + 1, col: nextCol - 1 });
  }
  if (
    se &&
    chessboard[nextRow + 1][nextCol + 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: nextRow + 1, col: nextCol + 1 });
  }
  return move;
}
