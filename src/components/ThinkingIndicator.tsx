import { useEffect, useState } from "react";
import auraLogo from "@/assets/aura-logo.png";

const PHASES = [
  "Thinking",
  "Defining the parameters",
  "Gathering context",
  "Refining the response",
  "Almost there",
];

export const ThinkingIndicator = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % PHASES.length);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex items-center gap-3 py-2 animate-fade-in-up">
      {/* Logo with rotating gradient ring */}
      <div className="relative h-8 w-8 flex-shrink-0">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, hsl(230 85% 62%), hsl(280 85% 65%), hsl(330 85% 62%), hsl(230 85% 62%))",
            animation: "thinking-spin 2.4s linear infinite",
            padding: "2px",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
          aria-hidden
        />
        <img
          src={auraLogo}
          alt=""
          className="absolute inset-1 h-6 w-6 object-contain"
        />
      </div>
      {/* Rotating thinking text with gradient shimmer */}
      <span
        key={idx}
        className="thinking-text-in thinking-text-shimmer text-[15px] font-medium tracking-tight"
      >
        {PHASES[idx]}
      </span>
    </div>
  );
};
