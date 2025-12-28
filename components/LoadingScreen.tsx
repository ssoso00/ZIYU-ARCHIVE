"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen({
  emoji = "💙",
}: {
  emoji?: string;
}) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => setDone(true), 400);
          return 100;
        }
        return p + 2;
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#eaf6ff]">
      {/* Emoji */}
      <div className="mb-4 text-[32px] animate-bounce-soft">
        {emoji}
      </div>

      {/* Battery Bar */}
      <div className="relative w-[180px] h-[14px] rounded-full bg-white overflow-hidden shadow-inner">
        <div
          className="absolute left-0 top-0 h-full bg-[#1da1ff] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Percent */}
      <div className="mt-2 text-[11px] text-slate-500">
        Profile Hub Loading... {progress}%
      </div>

      <style jsx>{`
        @keyframes bounceSoft {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-soft {
          animation: bounceSoft 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
