export async function getStockfishMove(
  fen: string,
  depth: number,
): Promise<string | null> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await fetch(
      `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${depth}`,
    );

    //TODO: On screen message for rate limited. Maybe add higher timer because if playing quickly against stockfish, this happens pretty frequently.
    if (response.status === 429) {
      console.warn("Rate limited by Stockfish API, please wait.");
      await new Promise((resolve) => setTimeout(resolve, 10000));
      return getStockfishMove(fen, depth);
    }

    const data = await response.json();

    if (!data.success || !data.bestmove) {
      return null;
    }

    const parts = data.bestmove.split(" ");
    const move = parts[1];

    if (!move) {
      return null;
    }

    return move;
  } catch (error) {
    return null;
  }
}

//Min of 5 as stockfish doesn't accept lower than 5
export function difficultyToDepth(difficulty: number): number {
  const depthMap: Record<number, number> = {
    1: 5,
    2: 6,
    3: 7,
    4: 8,
    5: 9,
    6: 10,
    7: 12,
    8: 13,
    9: 15,
  };
  return depthMap[difficulty];
}

export function uciToSquare(uci: string): {
  from: { row: number; col: number };
  to: { row: number; col: number };
} {
  const colMap: Record<string, number> = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
  };

  const fromCol = colMap[uci[0]];
  const fromRow = 8 - parseInt(uci[1]);
  const toCol = colMap[uci[2]];
  const toRow = 8 - parseInt(uci[3]);

  return {
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol },
  };
}
