import { useState, useEffect, useRef } from "react";
import { Crown, MessageCircle, X, SendHorizonal } from "lucide-react";

export interface ChatMessage {
  type: "move" | "message";
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
}

export function Chat({ entries, onSendMessage, playerColor }: ChatProps) {
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [entries]);

  function handleSend(): void {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  }

  const feed = (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-gray-800 overflow-hidden lg: ml-[-15%]">
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

      {/*Scrollable */}
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

      {/*Input */}
      <div className="flex gap-2 px-3 py-3 border-t border-gray-800">
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
      {/* Desktop */}
      <div className="hidden md:flex flex-col w-80 h-full">{feed}</div>

      {/*Mobile */}
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
