import { useState, useEffect, useRef } from "react";
import { Crown, MessageCircle, X, SendHorizonal } from "lucide-react";
import type { GameState } from "../../components/modals/gameover-modal";

export interface ChatMessage {
  type: "move" | "message" | "draw_offer";
  turn?: number;
  piece?: string;
  action?: "moves" | "takes";
  from?: string;
  to?: string;
  sender?: "white" | "black";
  text?: string;
  timestamp: number;
}

interface ChatProps {
  entries: ChatMessage[];
  onSendMessage: (text: string) => void;
  playerColor: "white" | "black";
  onDrawOffer: () => void;
  onDrawResponse?: (accepted: boolean) => void;
  onForfeit: () => void;
  vsAI: boolean;
  gameState: GameState;
}

export function Chat({
  entries,
  onSendMessage,
  playerColor,
  onDrawOffer,
  onDrawResponse,
  onForfeit,
  vsAI,
  gameState,
}: ChatProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const [drawPending, setDrawPending] = useState(false);
  const [respondedOffers, setRespondedOffers] = useState<Set<number>>(
    new Set(),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevEntriesLengthRef = useRef(entries.length);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [entries]);

  //Watch for new moves being appended to the log
  useEffect(() => {
    const prevLength = prevEntriesLengthRef.current;
    prevEntriesLengthRef.current = entries.length;

    if (entries.length <= prevLength) return;

    const newEntries = entries.slice(prevLength);
    const moveHappened = newEntries.some((e) => e.type === "move");
    if (!moveHappened) return;

    //Resets draw offer after move, now that it's non disurptive
    setDrawPending(false);

    //Declines if move is played
    const latestOfferIdx = entries
      .map((e, idx) => (e.type === "draw_offer" ? idx : -1))
      .filter((x) => x >= 0)
      .at(-1);

    if (latestOfferIdx === undefined) return;
    const latestOffer = entries[latestOfferIdx];

    if (
      latestOffer.sender !== playerColor &&
      !respondedOffers.has(latestOffer.timestamp)
    ) {
      setRespondedOffers((prev) => new Set(prev).add(latestOffer.timestamp));
      onDrawResponse?.(false);
    }
  }, [entries]);

  function handleSend(): void {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  }

  function handleDrawResponseClick(
    offerTimestamp: number,
    accepted: boolean,
  ): void {
    setRespondedOffers((prev) => new Set(prev).add(offerTimestamp));
    onDrawResponse?.(accepted);
  }

  const gameOver = gameState !== "ongoing";

  const feed = (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="text-sm font-medium text-gray-200 tracking-wide">
          Game Log
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/*Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {entries.length === 0 && (
          <p className="text-sm text-gray-600 text-center mt-8">No moves yet</p>
        )}
        {entries.map((entry, i) =>
          entry.type === "move" ? (
            <div key={i} className="flex flex-col gap-0.5">
              <span className="text-[11px] text-gray-500 font-medium tracking-wide">
                Turn {entry.turn}
              </span>
              <span className="text-[15px] text-gray-100 leading-snug">
                <span className="capitalize">{entry.piece}</span> {entry.action}{" "}
                {entry.from} → {entry.to}
              </span>
            </div>
          ) : entry.type === "draw_offer" ? (
            <div
              key={i}
              className="flex flex-col gap-2 bg-gray-800/60 rounded-lg px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <Crown
                  size={12}
                  className={
                    entry.sender === "white" ? "text-gray-300" : "text-gray-600"
                  }
                  fill="currentColor"
                />
                <span className="capitalize">{entry.sender}</span>
              </div>
              <span className="text-[14px] text-gray-200">Offers a draw</span>
              {/*Shows buttons on draw offer if latest */}
              {i ===
                entries
                  .map((e, idx) => (e.type === "draw_offer" ? idx : -1))
                  .filter((x) => x >= 0)
                  .at(-1) &&
                entry.sender !== playerColor &&
                (() => {
                  const disabled =
                    respondedOffers.has(entry.timestamp) || gameOver;
                  return (
                    <div className="flex gap-2 mt-1">
                      <button
                        disabled={disabled}
                        onClick={() =>
                          handleDrawResponseClick(entry.timestamp, true)
                        }
                        className="flex-1 rounded-md py-1.5 text-xs font-medium transition-colors
                          disabled:opacity-30 disabled:cursor-not-allowed
                          bg-white text-zinc-900 hover:bg-gray-200 disabled:hover:bg-white"
                      >
                        Accept
                      </button>
                      <button
                        disabled={disabled}
                        onClick={() =>
                          handleDrawResponseClick(entry.timestamp, false)
                        }
                        className="flex-1 rounded-md py-1.5 text-xs font-medium transition-colors
                          disabled:opacity-30 disabled:cursor-not-allowed
                          bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:hover:bg-gray-700"
                      >
                        Decline
                      </button>
                    </div>
                  );
                })()}
            </div>
          ) : (
            <div key={i} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium tracking-wide">
                <Crown
                  size={12}
                  className={
                    entry.sender === "white" ? "text-gray-300" : "text-gray-600"
                  }
                  fill="currentColor"
                />
                <span className="capitalize">{entry.sender}</span>
              </div>
              <span className="text-[15px] text-gray-100 leading-snug">
                {entry.text}
              </span>
            </div>
          ),
        )}
      </div>

      {/* Draw and forfeit buttons */}
      {!gameOver && (
        <div className="flex gap-2 px-3 pt-3 border-t border-gray-800">
          {/* Draw offer */}
          <button
            disabled={vsAI || drawPending}
            onClick={() => {
              setDrawPending(true);
              onDrawOffer();
            }}
            className="flex-1 rounded-lg py-2 text-xs font-medium transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed
              bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:hover:bg-gray-800"
          >
            {drawPending ? "Draw offered..." : "Offer Draw"}
          </button>

          {/* Forfeit */}
          {showForfeitConfirm ? (
            <div className="flex gap-1.5 flex-1">
              <button
                onClick={() => {
                  setShowForfeitConfirm(false);
                  onForfeit();
                }}
                className="flex-1 rounded-lg py-2 text-xs font-medium bg-red-900/60 text-red-300 hover:bg-red-900 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowForfeitConfirm(false)}
                className="flex-1 rounded-lg py-2 text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowForfeitConfirm(true)}
              className="flex-1 rounded-lg py-2 text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Forfeit
            </button>
          )}
        </div>
      )}

      {/*Input */}
      <div className="flex gap-2 px-3 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Send a message"
          className="flex-1 rounded-lg bg-gray-800/80 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none border border-transparent focus:border-gray-600 transition-colors"
        />
        <button
          onClick={handleSend}
          className="rounded-lg bg-gray-100 px-3 text-zinc-900 hover:bg-white transition-colors flex items-center justify-center cursor-pointer"
        >
          <SendHorizonal size={17} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:flex flex-col w-80 h-full">{feed}</div>
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 rounded-full bg-gray-100 p-3.5 text-zinc-900 shadow-lg shadow-black/40"
        >
          <MessageCircle size={20} />
        </button>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="w-full max-w-lg h-[70vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {feed}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
