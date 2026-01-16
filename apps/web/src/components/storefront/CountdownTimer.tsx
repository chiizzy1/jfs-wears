"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDate: string | Date;
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function CountdownTimer({ endDate, className, size = "md", label = "Sale Ends In:" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Avoid hydration mismatch by waiting for mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!mounted || timeLeft.isExpired) return null;

  const sizeClasses = {
    sm: "text-xs p-1 gap-2",
    md: "text-sm p-2 gap-3",
    lg: "text-base p-3 gap-4",
  };

  const numberClasses = {
    sm: "text-sm min-w-[1.5rem]",
    md: "text-lg min-w-[2rem]",
    lg: "text-2xl min-w-[2.5rem]",
  };

  const labelClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className={cn("inline-flex items-center bg-black text-white sharp-edges", sizeClasses[size], className)}>
      {label && <span className="font-medium mr-1 uppercase tracking-wider">{label}</span>}
      <Clock className={cn("text-red-500 animate-pulse", size === "lg" ? "w-5 h-5" : "w-4 h-4")} />

      <div className="flex items-center text-center">
        <TimeUnit
          value={timeLeft.days}
          label="Days"
          numberClass={numberClasses[size]}
          labelClass={labelClasses[size]}
          show={timeLeft.days > 0}
        />
        {timeLeft.days > 0 && <span className="mx-1 opacity-50">:</span>}

        <TimeUnit value={timeLeft.hours} label="Hrs" numberClass={numberClasses[size]} labelClass={labelClasses[size]} />
        <span className="mx-1 opacity-50">:</span>

        <TimeUnit value={timeLeft.minutes} label="Mins" numberClass={numberClasses[size]} labelClass={labelClasses[size]} />
        <span className="mx-1 opacity-50">:</span>

        <TimeUnit value={timeLeft.seconds} label="Secs" numberClass={numberClasses[size]} labelClass={labelClasses[size]} />
      </div>
    </div>
  );
}

function TimeUnit({
  value,
  label,
  numberClass,
  labelClass,
  show = true,
}: {
  value: number;
  label: string;
  numberClass: string;
  labelClass: string;
  show?: boolean;
}) {
  if (!show) return null;
  return (
    <div className="flex flex-col leading-none">
      <span className={cn("font-bold tabular-nums font-mono tracking-widest", numberClass)}>
        {value.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
