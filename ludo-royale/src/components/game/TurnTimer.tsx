import React, { useEffect, useState } from 'react';

interface TurnTimerProps {
  limit: number | null;
  turnNumber: number; // to reset timer on new turn
  onExpire: () => void;
}

export const TurnTimer: React.FC<TurnTimerProps> = ({ limit, turnNumber, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(limit || 0);

  useEffect(() => {
    if (limit) setTimeLeft(limit);
  }, [limit, turnNumber]);

  useEffect(() => {
    if (!limit || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [limit, timeLeft, onExpire]);

  if (!limit) return null;

  const progress = timeLeft / limit;
  const strokeDashoffset = 126 - (126 * progress); // 2 * PI * r (r=20) ≈ 126

  let color = '#10b981'; // green
  if (timeLeft <= 10) color = '#f59e0b'; // yellow
  if (timeLeft <= 5) color = '#ef4444'; // red

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r="20"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="32"
          cy="32"
          r="20"
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray="126"
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className={`absolute text-lg font-bold ${timeLeft <= 5 ? 'animate-pulse text-ruby-400' : 'text-white'}`}>
        {timeLeft}
      </div>
    </div>
  );
};
