import { useNavigate } from "react-router-dom";

export default function ChessBoard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-900 flex justify-center items-center p-4">
      <div className="absolute top-0 left-0 w-[1vw]">
        <button
          className="border bg-red-500 text-black"
          onClick={() => navigate("/")}
        >
          Return
        </button>
      </div>
      <div className="grid grid-cols-8 w-[80vw] md:w-[90vw] lg:w-[95v max-w-170 aspect-square shadow-2xl">
        {Array.from({ length: 64 }).map((_, i) => {
          //Convert 64 squares into 8x8 grid
          const row = Math.floor(i / 8);
          const col = i % 8;

          const darkTile = (row + col) % 2 === 1;
          const isTopLeft = row === 0 && col === 0 ? true : false;
          const isTopRight = row === 0 && col === 7 ? true : false;
          const isBottomLeft = row === 7 && col === 0 ? true : false;
          const isBottomRight = row === 7 && col === 7 ? true : false;

          return (
            <div
              key={i}
              className={`flex justify-center items-center select-none
                ${darkTile ? "bg-gray-800" : "bg-gray-500"}
                ${isTopLeft ? "rounded-tl" : ""}
                ${isTopRight ? "rounded-tr" : ""}
                ${isBottomLeft ? "rounded-bl" : ""}
                ${isBottomRight ? "rounded-br" : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
}
