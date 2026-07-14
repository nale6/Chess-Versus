import type { Piece, Move, Square, ChessBoard, Color } from "./chessTypes";

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

  //Forward
  if (nextRow >= 0 && nextRow < 8) {
    if (chessboard[nextRow][column].squarePiece === null) {
      move.push({ row: nextRow, col: column });
    }
  }
  //Double-move from start
  if (!piece.moved && move.length > 0) {
    if (chessboard[nextRowNoMove][column].squarePiece === null) {
      move.push({ row: nextRowNoMove, col: column, enPassant: true });
    }
  }
  //Diagonal
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

  //En passant captures
  if (column - 1 >= 0) {
    const adjacent = chessboard[square.row][column - 1];
    if (
      adjacent.squarePiece &&
      adjacent.squarePiece.type === "pawn" &&
      adjacent.squarePiece.color !== piece.color &&
      adjacent.enPassant === true
    ) {
      move.push({ row: nextRow, col: column - 1, enPassant: true });
    }
  }
  if (column + 1 < 8) {
    const adjacent = chessboard[square.row][column + 1];
    if (
      adjacent.squarePiece &&
      adjacent.squarePiece.type === "pawn" &&
      adjacent.squarePiece.color !== piece.color &&
      adjacent.enPassant === true
    ) {
      move.push({ row: nextRow, col: column + 1, enPassant: true });
    }
  }

  return move;
}

//Returns only diagonal attacks for calculating valid moves
export function pawnAttack(
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
  nextRow = square.row;
  nextColumn = square.col;
  while (northE) {
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

export function kingMoves(
  piece: Piece,
  square: Square,
  chessboard: ChessBoard,
  simulation: boolean = false,
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

  //Castling
  if (!simulation && square.squarePiece!.moved === false) {
    let i = 1;

    while (e) {
      const column = nextCol + i;
      if (column >= 8) break;
      if (
        chessboard[nextRow][nextCol + i].squarePiece?.type === "rook" &&
        chessboard[nextRow][nextCol + i].squarePiece!.moved === false
      ) {
        move.push({
          row: nextRow,
          col: nextCol + (i - 1),
          castle: true,
          castleDir: "right",
        });
        break;
      }
      if (chessboard[nextRow][nextCol + i].squarePiece?.color === piece.color) {
        e = false;
      } else if (chessboard[nextRow][nextCol + i].squarePiece === null) {
        i++;
      } else {
        e = false;
      }
      if (square.squarePiece!.color === "white" && i === 4) {
        e = false;
        break;
      } else if (square.squarePiece!.color === "black" && i === 4) {
        e = false;
        break;
      }
    }
  }

  //Castling
  if (!simulation && square.squarePiece!.moved === false) {
    let i = 1;

    while (w) {
      const column = nextCol - i;
      if (column < 0) break;
      if (
        chessboard[nextRow][nextCol - i].squarePiece?.type === "rook" &&
        chessboard[nextRow][nextCol - i].squarePiece!.moved === false
      ) {
        move.push({
          row: nextRow,
          col: nextCol - (i - 1),
          castle: true,
          castleDir: "left",
        });
        break;
      }
      if (chessboard[nextRow][nextCol - i].squarePiece?.color === piece.color) {
        w = false;
      } else if (chessboard[nextRow][nextCol - i].squarePiece === null) {
        i++;
      } else {
        w = false;
      }
      if (square.squarePiece!.color === "white" && i === 5) {
        w = false;
        break;
      } else if (square.squarePiece!.color === "black" && i === 5) {
        w = false;
        break;
      }
    }
  }

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

//Grabs all moves from one player
export function getMoves(color: Color, chessboard: ChessBoard): Move[] {
  const move: Move[] = [];
  chessboard.flat().forEach((sqr) => {
    if (sqr.squarePiece && sqr.squarePiece.color === color) {
      switch (sqr.squarePiece.type) {
        case "pawn":
          // const dir = sqr.squarePiece.color === "white" ? -1 : 1;
          // if (sqr.col > 0 && sqr.col < 7) {
          //   if (!sqr.squarePiece.moved) {
          //     move.push({ row: sqr.row + dir * 2, col: sqr.col });
          //   }
          //   move.push({ row: sqr.row + dir, col: sqr.col - 1 });
          //   move.push({ row: sqr.row + dir, col: sqr.col + 1 });
          // } else if (sqr.col === 0) {
          //   move.push({ row: sqr.row + dir, col: sqr.col + 1 });
          // } else if (sqr.col === 7) {
          //   move.push({ row: sqr.row + dir, col: sqr.col - 1 });
          // }
          const pawnMove = pawnMoves(sqr.squarePiece, sqr, chessboard);
          pawnMove.forEach((pMove) => {
            move.push(pMove);
          });
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
          const kingMove = kingMoves(sqr.squarePiece, sqr, chessboard, true);
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

//Grabs ENEMY moves, only change is pawns just have their atk movement
export function getEnemyMoves(color: Color, chessboard: ChessBoard): Move[] {
  const move: Move[] = [];
  chessboard.flat().forEach((sqr) => {
    if (sqr.squarePiece && sqr.squarePiece.color !== color) {
      switch (sqr.squarePiece.type) {
        case "pawn":
          const pawnMove = pawnAttack(sqr.squarePiece, sqr, chessboard);
          pawnMove.forEach((pMove) => {
            move.push(pMove);
          });
          // pawnAttack(sqr.squarePiece, sqr, chessboard).forEach((m) => move.push(m));
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

//Filters legal moves by comparing each
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

//Checks if given board has a king in check
export function check(color: Color, chessboard: ChessBoard): boolean {
  let inCheck = false;
  const checkingMoves: Move[] = [];
  const enemyColor = color === "white" ? "black" : "white";
  const moves: Move[] = getMoves(enemyColor, chessboard);
  moves.forEach((move) => {
    if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
      if (chessboard[move.row][move.col].squarePiece?.type === "king") {
        //DEBUG
        // console.log(
        //   chessboard[move.row][move.col].squarePiece?.color,
        //   "'s king is in check and needs to move.",
        // );
        // console.log(move);
        inCheck = true;
        checkingMoves.push(move);
      }
    }
  });
  return inCheck;
}

//Checks legal moves
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

//Simulates move and returns if would be in check, used to prevent discovered check moves
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

//TODO modal that allows player to choose what to rank up, defaulting to queen for now. This function selects what type to rank up to, add more types and add parameter to take in piece type
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

//Finds and returns if there is any legal moves for color's side
export function hasLegalMove(color: Color, chessboard: ChessBoard): boolean {
  let moveCount = 0;

  for (const square of chessboard.flat()) {
    if (!square.squarePiece || square.squarePiece.color !== color) continue;

    let candidates: Move[] = [];
    switch (square.squarePiece.type) {
      case "pawn":
        candidates = pawnMoves(square.squarePiece, square, chessboard);
        break;
      case "rook":
        candidates = rookMoves(square.squarePiece, square, chessboard);
        break;
      case "bishop":
        candidates = bishopMoves(square.squarePiece, square, chessboard);
        break;
      case "queen":
        candidates = queenMoves(square.squarePiece, square, chessboard);
        break;
      case "knight":
        candidates = knightMoves(square.squarePiece, square, chessboard);
        break;
      case "king":
        candidates = kingMoves(square.squarePiece, square, chessboard, true);
        break;
    }

    const MAX_MOVES = 500;

    for (const move of candidates) {
      moveCount++;
      if (moveCount > MAX_MOVES) {
        console.error("hasLegalMove infinite recursion");
        return true;
      }
      // console.log("testing move:", moveCount, move);
      if (
        !simulateMove(
          square,
          chessboard,
          { ...square, row: move.row, col: move.col },
          color,
        )
      ) {
        // console.log("legal move found:", move);
        return true;
      }
    }
  }
  // console.log("no legal moves found");
  return false;
}

//Checks if game should be over or ongoing
export function getGameState(color: Color, chessboard: ChessBoard): string {
  if (hasLegalMove(color, chessboard))
    return "ongoing"; // if no legal moves then gg
  else if (check(color, chessboard)) return "checkmate";
  else return "stalemate";
}

//Should almost never happen in a real game, if 50 moves from BOTH players are made and no progress is made on board, it's a draw
export function isFiftyMoveDraw(halfMoves: number): boolean {
  return halfMoves >= 100;
}

//Checks the fen history ref and if the board state is the same for last 3 positions then it's a draw.
export function isThreeRepetitionDraw(fenHistory: string[]): boolean {
  const counts = new Map<string, number>();
  for (const fen of fenHistory) {
    const position = fen.split(" ")[0];
    counts.set(position, (counts.get(position) ?? 0) + 1);
    if (counts.get(position)! >= 3) return true;
  }
  return false;
}
