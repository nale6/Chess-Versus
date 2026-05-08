import type { Player, Color } from "./chessboard";

export function createPlayer(color: Color): Player {
  return {
    color,
    //TODO: Either keep or remove, id is player's id such as name or unique identifier.
    id: null,
    //White is always first
    isTurn: color === "white" ? true : false,
  };
}
