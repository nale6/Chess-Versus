import { useState } from "react";
import type { Piece, Move, Square, ChessBoard, Color } from "./chessTypes";

//TODO when pawn reaches end, can upgrade piece to knight, bishop, rook or queen
//Add en passante
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
  if (!piece.moved && move.length > 0) {
    if (chessboard[nextRowNoMove][column].squarePiece === null) {
      move.push({ row: nextRowNoMove, col: column });
    }
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
//Also add castling
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
  // const illegalMoves = kingLegal(piece, chessboard);
  // move.forEach((mve) => {
  //   illegalMoves.forEach((lmve) => {
  //     if (mve === lmve) {
  //       const index = move.indexOf(mve);
  //       move.splice(index, 1);
  //     }
  //   });
  // });
  // console.log(move);
  return move;
}

//Knight has 6 movement options
export function knightMoves(
  piece: Piece,
  square: Square,
  chessboard: ChessBoard,
): Move[] {
  const move: Move[] = [];
  const cRow = square.row;
  const cCol = square.col;
  //North L movements
  if (
    cRow - 2 >= 0 &&
    cCol - 1 >= 0 &&
    chessboard[cRow - 2][cCol - 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: cRow - 2, col: cCol - 1 });
  }
  if (
    cRow - 2 >= 0 &&
    cCol + 1 <= 7 &&
    chessboard[cRow - 2][cCol + 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: cRow - 2, col: cCol + 1 });
  }
  //South L movements
  if (
    cRow + 2 <= 7 &&
    cCol - 1 >= 0 &&
    chessboard[cRow + 2][cCol - 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: cRow + 2, col: cCol - 1 });
  }
  if (
    cRow + 2 <= 7 &&
    cCol + 1 <= 7 &&
    chessboard[cRow + 2][cCol + 1].squarePiece?.color !== piece.color
  ) {
    move.push({ row: cRow + 2, col: cCol + 1 });
  }
  //West L movements
  if (
    cRow - 1 >= 0 &&
    cCol - 2 >= 0 &&
    chessboard[cRow - 1][cCol - 2].squarePiece?.color !== piece.color
  ) {
    move.push({ row: cRow - 1, col: cCol - 2 });
  }
  if (
    cRow + 1 <= 7 &&
    cCol - 2 >= 0 &&
    chessboard[cRow + 1][cCol - 2].squarePiece?.color !== piece.color
  ) {
    move.push({ row: cRow + 1, col: cCol - 2 });
  }
  //East L movements
  if (
    cRow - 1 >= 0 &&
    cCol + 2 <= 7 &&
    chessboard[cRow - 1][cCol + 2].squarePiece?.color !== piece.color
  ) {
    move.push({ row: cRow - 1, col: cCol + 2 });
  }
  if (
    cRow + 1 <= 7 &&
    cCol + 2 <= 7 &&
    chessboard[cRow + 1][cCol + 2].squarePiece?.color !== piece.color
  ) {
    move.push({ row: cRow + 1, col: cCol + 2 });
  }
  return move;
}

//TODO: Bug since the moves stop at first piece it meets, lets the king be in check but move 'backwards' and will still be in check
export function getMoves(color: Color, chessboard: ChessBoard): Move[] {
  const move: Move[] = [];
  chessboard.flat().forEach((sqr) => {
    if (sqr.squarePiece && sqr.squarePiece.color !== color) {
      switch (sqr.squarePiece.type) {
        case "pawn":
          const dir = sqr.squarePiece.color === "white" ? -1 : 1;
          if (sqr.col > 0 && sqr.col < 7) {
            move.push({ row: sqr.row + dir, col: sqr.col - 1 });
            move.push({ row: sqr.row + dir, col: sqr.col + 1 });
          } else if (sqr.col === 0) {
            move.push({ row: sqr.row + dir, col: sqr.col + 1 });
          } else if (sqr.col === 7) {
            move.push({ row: sqr.row + dir, col: sqr.col - 1 });
          }
          break;

        case "rook":
          const rookMove = rookMoves(sqr.squarePiece, sqr, chessboard);
          rookMove.forEach((rMove) => {
            move.push(rMove);
          });
          break;

        case "bishop":
          const bishopMove = bishopMoves(sqr.squarePiece, sqr, chessboard);
          bishopMove.forEach((bMove) => {
            move.push(bMove);
          });
          break;

        case "queen":
          const queenMove = queenMoves(sqr.squarePiece, sqr, chessboard);
          queenMove.forEach((qMove) => {
            move.push(qMove);
          });
          break;

        case "knight":
          const knightMove = knightMoves(sqr.squarePiece, sqr, chessboard);
          knightMove.forEach((knMove) => {
            move.push(knMove);
          });
          break;

        case "king":
          const kingMove = kingMoves(sqr.squarePiece, sqr, chessboard);
          kingMove.forEach((kMove) => {
            move.push(kMove);
          });
          break;

        default:
          break;
      }
    }
  });
  return move;
}

export function filterLegalMoves(
  illegalMoves: Move[],
  allMoves: Move[],
): Move[] {
  illegalMoves.forEach((illegalMove) => {
    allMoves.forEach((move) => {
      if (move.row === illegalMove.row && move.col === illegalMove.col) {
        const index = allMoves.indexOf(move);
        allMoves.splice(index, 1);
      }
    });
  });
  let legalMoves = allMoves;
  return legalMoves;
}

//TODO: This only works if enemy has NO legal moves left. Need another function exploring if opponent is checkmated DESPITE having legal moves.
//TODO: Of course this also means that there needs to be a check logic (done) and logic that only allows moves that would deny checkmate if possible.
//TODO: Discovered check logic
export function staleCheckMate(color: Color, chessboard: ChessBoard): void {
  let checkmate = false;
  const moves = getMoves(color, chessboard);
  moves.forEach((move) => {
    if (
      chessboard[move.row][move.col].squarePiece?.type === "king" &&
      chessboard[move.row][move.col].squarePiece?.color === color
    ) {
      checkmate = true;
    }
  });
  //DEBUG
  console.log("Checkmate true stalemate false: ", checkmate);
}

export function check(color: Color, chessboard: ChessBoard): boolean {
  let inCheck = false;
  const checkingMoves: Move[] = [];
  const moves: Move[] = getMoves(color, chessboard);
  moves.forEach((move) => {
    if (chessboard[move.row][move.col].squarePiece?.type === "king") {
      //DEBUG
      console.log(
        chessboard[move.row][move.col].squarePiece?.color,
        "'s king is in check and needs to move.",
      );
      console.log(move);
      inCheck = true;
      checkingMoves.push(move);
    }
  });
  return inCheck;
}

//TODO finish returning legal moves that block check or move king
export function checkMoves(
  color: Color,
  chessboard: ChessBoard,
  checkingMoves: Move[],
): Move[] {
  const legalMoves: Move[] = [];
  //TODO Change logic for getMoves and create getEnemyMoves or vice versa for readability
  let opposite: Color = color === "white" ? "black" : color;
  const myMoves: Move[] = getMoves(opposite, chessboard);
  myMoves.forEach((move) => {
    checkingMoves.forEach((checkedMove) => {
      if (
        chessboard[move.row][move.col] ===
        chessboard[checkedMove.row][checkedMove.col]
      ) {
        legalMoves.push(move);
      }
    });
  });

  return legalMoves;
}

export function simulateMove(
  prevSquare: Square,
  chessboard: ChessBoard,
  square: Square,
  color: Color,
): boolean {
  let clone = structuredClone(chessboard);
  clone[prevSquare.row][prevSquare.col].squarePiece = null;
  clone[square.row][square.col].squarePiece = prevSquare.squarePiece;
  return check(color, clone);
}

export function rankUp(square: Square): void {
  square.squarePiece!.type = "queen";
}

//TODO: Let player choose piece to rank up to with a modal displaying options. For now auto ranks up to queen
export function autoRankUp(color: Color, board: ChessBoard): void {
  if (color === "white") {
    board.flat().forEach((square) => {
      if (
        square.row === 0 &&
        square.squarePiece &&
        square.squarePiece.type === "pawn"
      ) {
        rankUp(square);
      }
    });
  } else if (color === "black") {
    board.flat().forEach((square) => {
      if (
        square.row === 7 &&
        square.squarePiece &&
        square.squarePiece.type === "pawn"
      ) {
        rankUp(square);
      }
    });
  }
}

//TODO draw on repeated move 3x
