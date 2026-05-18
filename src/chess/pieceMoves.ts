import { useState } from "react";
import type { Piece, Move, Square, ChessBoard } from "./chessTypes";

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
