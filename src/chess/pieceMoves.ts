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
  //Pawns stay in same column unless they can take or en passant rule applies (check if that's what it's called)
  const column = square.col;

  //Add legal move bool as part of AND conditional later. Just working on movement for now.
  if (chessboard[nextRow][column].isEmpty) {
    move.push({ row: nextRow, col: column });
  }

  return move;
}
