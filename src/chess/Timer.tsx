import { useEffect, useRef, useState } from "react";

interface TimerProps {
  initialSeconds: number;
  isActive: boolean;
  isGameOver: boolean;
  increment: number; //1 enable increment, 0 disable
  onTimeout: () => void;
  label: string;
}

export function Timer({
  initialSeconds,
  isActive,
  isGameOver,
  increment,
  onTimeout,
  label,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
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
  const isLow = timeLeft <= 10;

  //Reset when initialSeconds changes
  useEffect(() => {
    setTimeLeft(initialSeconds);
    frozenTimeRef.current = null;
  }, [initialSeconds]);

  useEffect(() => {
    if (isGameOver && frozenTimeRef.current === null) {
      frozenTimeRef.current = timeLeft;
    }
    if (!isGameOver) {
      frozenTimeRef.current = null;
    }
  }, [isGameOver]);

  //Increment timer
  useEffect(() => {
    if (isGameOver) return;
    if (!isActive && increment > 0 && prevActiveRef.current === true) {
      setTimeLeft((prev) => prev + increment);
    }
    prevActiveRef.current = isActive;
  }, [isActive, isGameOver]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isActive || isGameOver || timeLeft <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isGameOver]);

  useEffect(() => {
    if (timeLeft === 0 && !isGameOver && !timeoutHappenedRef.current) {
      timeoutHappenedRef.current = true;
      onTimeout();
    }
  });

  useEffect(() => {
    setTimeLeft(initialSeconds);
    frozenTimeRef.current = null;
  }, [initialSeconds]);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    frozenTimeRef.current = null;
    timeoutHappenedRef.current = false;
  }, [initialSeconds]);

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
