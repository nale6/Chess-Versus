export type Color = "white" | "black";

//TODO: Add name etc for profile functionality or remove id otherwise
//Keep in mind need to translate to FEN later for chess apis
export type Player = {
  color: Color;
  //Placeholder for now
  id: null;
  isTurn?: boolean;
};

export type Move = {
  row: number;
  col: number;
};

export type PieceType =
  | "pawn"
  | "bishop"
  | "knight"
  | "rook"
  | "queen"
  | "king";

export type Piece = {
  type: PieceType;
  color: Color;
  moved?: boolean;
  turnCount: number;
};

export type Square = {
  squarePiece: Piece | null;
  row: number;
  col: number;
  isEmpty?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  darkTile?: boolean;
  isTopLeft?: boolean;
  isTopRight?: boolean;
  isBottomLeft?: boolean;
  isBottomRight?: boolean;
  coordinate: string;
};

export type ChessBoard = Square[][];
