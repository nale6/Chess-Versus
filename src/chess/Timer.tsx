import { useEffect, useRef, useState } from "react";

interface TimerProps {
  initialSeconds: number;
  isActive: boolean;
  isGameOver: boolean;
  increment: number; //1 enable increment, 0 disable
  onTimeout: () => void;
  label: string;
  initialRemaining?: number; //Restores saved clock
  onTick?: (secondsLeft: number) => void; //Reports to parent to save remaining seconds to local storage
  countUp?: boolean; //true = clocks start at 0 and count time spent (no timeout)
}

export function Timer({
  initialSeconds,
  isActive,
  isGameOver,
  increment,
  onTimeout,
  label,
  initialRemaining,
  onTick,
  countUp = false,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(
    countUp ? (initialRemaining ?? 0) : (initialRemaining ?? initialSeconds),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevActiveRef = useRef(isActive);
  const frozenTimeRef = useRef<number | null>(null);
  const timeoutHappenedRef = useRef(false);

  const displayTime =
    isGameOver && frozenTimeRef.current !== null
      ? frozenTimeRef.current
      : timeLeft;

  const minutes = Math.floor(displayTime / 60);
  const seconds = timeLeft % 60;
  const isLow = !countUp && timeLeft <= 10;

  //Reset when initialSeconds changes, also honors restored clock value
  useEffect(() => {
    setTimeLeft(
      countUp ? (initialRemaining ?? 0) : (initialRemaining ?? initialSeconds),
    );
    frozenTimeRef.current = null;
    timeoutHappenedRef.current = false;
  }, [initialSeconds, initialRemaining, countUp]);

  useEffect(() => {
    if (isGameOver && frozenTimeRef.current === null) {
      frozenTimeRef.current = timeLeft;
    }
    if (!isGameOver) {
      frozenTimeRef.current = null;
    }
  }, [isGameOver]);

  //Increment timer (count-down only)
  useEffect(() => {
    if (countUp) {
      prevActiveRef.current = isActive;
      return;
    }
    if (isGameOver) return;
    if (!isActive && increment > 0 && prevActiveRef.current === true) {
      setTimeLeft((prev) => {
        const next = prev + increment;
        onTick?.(next);
        return next;
      });
    }
    prevActiveRef.current = isActive;
  }, [isActive, isGameOver, countUp]);

  //Ticks save remaining time
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isActive || isGameOver) return;
    if (!countUp && timeLeft <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (countUp) {
          const next = prev + 1;
          onTick?.(next);
          return next;
        }
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onTick?.(0);
          return 0;
        }
        const next = prev - 1;
        onTick?.(next);
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isGameOver, countUp]);

  useEffect(() => {
    if (countUp) return;
    if (timeLeft === 0 && !isGameOver && !timeoutHappenedRef.current) {
      timeoutHappenedRef.current = true;
      onTimeout();
    }
  });

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl px-6 py-3 transition-all duration-300
        ${isActive && !isGameOver ? "bg-gray-800 ring-2 ring-white" : "bg-zinc-900"}`}
    >
      <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span
        className={`text-3xl font-mono font-bold tabular-nums
          ${isLow && isActive ? "text-red-400" : "text-white"}`}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
