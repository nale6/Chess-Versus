import type { Color, Piece, PieceType } from "./chessboard";

export function createPiece(type: PieceType, color: Color): Piece {
  return {
    type,
    color,
    moved: false,
    turnCount: 0,
  };
}
