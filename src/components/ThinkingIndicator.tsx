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
    <div
      className="flex items-center gap-3 py-2 animate-fade-in-up"
      role="status"
      aria-live="polite"
      aria-label={`${PHASES[idx]}…`}
    >
      {/* Logo with soft pulsing halo */}
      <div className="relative h-7 w-7 flex-shrink-0">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full thinking-halo"
        />
        <img
          src={auraLogo}
          alt=""
          className="absolute inset-0 h-7 w-7 object-contain thinking-logo-pulse"
        />
      </div>

      {/* Rotating status label */}
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span
          key={idx}
          className="thinking-text-in thinking-label text-[14px] font-medium tracking-tight text-foreground/80"
        >
          {PHASES[idx]}
        </span>
        <span aria-hidden className="thinking-ellipsis text-foreground/60 text-[14px] font-medium">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </div>
    </div>
  );
};
