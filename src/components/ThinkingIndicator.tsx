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
      {/* Logo with animated gradient sweep via mask */}
      <div
        className="thinking-logo-mask h-7 w-7 flex-shrink-0"
        style={{ ["--logo-mask" as any]: `url(${auraLogo})` }}
        aria-hidden
      />
      {/* Rotating thinking text with shimmer */}
      <div className="relative h-5 overflow-hidden">
        <span
          key={idx}
          className="thinking-text-in thinking-text-shimmer text-[15px] font-medium tracking-tight"
        >
          {PHASES[idx]}
        </span>
      </div>
    </div>
  );
};
