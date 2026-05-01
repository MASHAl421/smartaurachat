import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Heart, Volume2, Square, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  onRegenerate?: () => void;
  messageId?: string;
  initialFeedback?: "up" | "down" | null;
  onEdit?: (newText: string) => void;
}

type Feedback = "up" | "down" | null;

const ActionButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void;
    label: string;
    className?: string;
    children: React.ReactNode;
  }
>(({ onClick, label, className = "", children }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
  >
    {children}
  </button>
));
ActionButton.displayName = "ActionButton";

export const ChatMessage = ({ role, content, streaming, onRegenerate, messageId, initialFeedback = null, onEdit }: Props) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(initialFeedback);
  const [likeAnim, setLikeAnim] = useState(false);
  const [dislikeAnim, setDislikeAnim] = useState(false);
  const [burst, setBurst] = useState<{ kind: "up" | "down"; key: number } | null>(null);
  const [particles, setParticles] = useState<{ id: number; px: number; py: number; kind: "up" | "down" }[]>([]);
  const particleId = useRef(0);

  useEffect(() => { setFeedback(initialFeedback); }, [initialFeedback, messageId]);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (utteranceRef.current && typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stripMarkdown = (md: string) =>
    md
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[*_~#>]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const detectLang = (text: string): "ur" | "hi" | "en" => {
    // Urdu/Arabic script range
    if (/[\u0600-\u06FF\u0750-\u077F]/.test(text)) return "ur";
    // Devanagari (Hindi)
    if (/[\u0900-\u097F]/.test(text)) return "hi";
    // Roman Urdu / Hinglish heuristic — common transliterated words
    if (/\b(hai|hain|nahi|nahin|kya|kyun|kaisa|kaise|acha|accha|theek|thik|aap|tum|mera|tera|hum|main|bhi|aur|lekin|magar|sirf|abhi|kabhi|matlab|samajh|chahiye|kar|karo|karna|raha|rahi|rahe|gaya|gayi|gaye|mujhe|tujhe|hamen|unhen|ye|wo|woh|jab|tab|phir|toh)\b/i.test(text)) {
      return "ur"; // Urdu voice handles roman urdu acceptably; closer than en
    }
    return "en";
  };

  const pickVoice = (lang: "ur" | "hi" | "en"): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const prefs: Record<typeof lang, string[]> = {
      ur: ["ur-PK", "ur-IN", "ur", "hi-IN", "hi"],
      hi: ["hi-IN", "hi", "ur-PK", "ur"],
      en: ["en-US", "en-GB", "en"],
    };
    for (const code of prefs[lang]) {
      const match = voices.find((v) => v.lang?.toLowerCase().startsWith(code.toLowerCase()));
      if (match) return match;
    }
    return null;
  };

  const handleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Speech not supported in this browser");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = stripMarkdown(content);
    if (!text) return;
    window.speechSynthesis.cancel();

    const speakNow = () => {
      const lang = detectLang(text);
      const voice = pickVoice(lang);
      const utt = new SpeechSynthesisUtterance(text);
      const langMap = { ur: "ur-PK", hi: "hi-IN", en: "en-US" } as const;
      utt.lang = voice?.lang || langMap[lang];
      if (voice) utt.voice = voice;
      utt.rate = lang === "en" ? 1 : 0.95;
      utt.pitch = 1;
      utt.onend = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
      setSpeaking(true);
    };

    // Voices may load async on some browsers
    if (!window.speechSynthesis.getVoices().length) {
      const onVoices = () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
        speakNow();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoices);
      // Fallback in case event never fires
      setTimeout(() => speakNow(), 200);
    } else {
      speakNow();
    }
  };


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const spawnParticles = (kind: "up" | "down") => {
    const items = Array.from({ length: 6 }).map(() => {
      const angle = (Math.random() * Math.PI) - Math.PI / 2; // upward arc
      const dist = 22 + Math.random() * 18;
      return {
        id: ++particleId.current,
        px: Math.cos(angle) * dist,
        py: -Math.abs(Math.sin(angle) * dist) - 8,
        kind,
      };
    });
    setParticles((prev) => [...prev, ...items]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !items.find((i) => i.id === p.id)));
    }, 950);
  };

  const handleFeedback = async (val: "up" | "down") => {
    const wasActive = feedback === val;
    const next = wasActive ? null : val;
    setFeedback(next);
    if (!wasActive) {
      if (val === "up") {
        setLikeAnim(false);
        requestAnimationFrame(() => setLikeAnim(true));
        setTimeout(() => setLikeAnim(false), 600);
      } else {
        setDislikeAnim(false);
        requestAnimationFrame(() => setDislikeAnim(true));
        setTimeout(() => setDislikeAnim(false), 600);
      }
      spawnParticles(val);
      setBurst({ kind: val, key: Date.now() });
      setTimeout(() => setBurst(null), 1000);
    }

    if (!messageId) return;
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      if (next === null) {
        await supabase.from("message_feedback").delete().eq("message_id", messageId).eq("user_id", uid);
      } else {
        await supabase.from("message_feedback").upsert(
          { message_id: messageId, user_id: uid, rating: next, updated_at: new Date().toISOString() },
          { onConflict: "message_id,user_id" }
        );
      }
    } catch {
      // silent — UI feedback already shown
    }
  };

  if (isUser) {
    return (
      <div data-role="user" className="group flex flex-col items-end animate-fade-in-up scroll-mt-4">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3">
            <p className="whitespace-pre-wrap leading-relaxed text-[14.5px] sm:text-[15px]">{content}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton onClick={handleCopy} label={copied ? "Copied" : "Copy"}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div data-role="assistant" className="animate-fade-in-up w-full scroll-mt-4">
      {content ? (
        <>
          <div className="prose-chat">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
            {streaming && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm align-middle" />}
          </div>
          {!streaming && (
            <div className="flex items-center gap-0.5 mt-2">
              <ActionButton onClick={handleCopy} label={copied ? "Copied" : "Copy"}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </ActionButton>

              <ActionButton
                onClick={() => handleFeedback("up")}
                label="Good response"
                className={feedback === "up" ? "!text-[hsl(212_92%_52%)] bg-[hsl(212_92%_52%/0.1)]" : ""}
              >
                <ThumbsUp
                  className={`h-3.5 w-3.5 ${likeAnim ? "animate-like-pop" : ""}`}
                  fill={feedback === "up" ? "currentColor" : "none"}
                />
                {/* particles */}
                {particles.filter((p) => p.kind === "up").map((p) => (
                  <Heart
                    key={p.id}
                    className="particle absolute left-1/2 top-1/2 h-3 w-3 text-[hsl(212_92%_52%)] pointer-events-none"
                    fill="currentColor"
                    style={{ ["--px" as any]: `${p.px}px`, ["--py" as any]: `${p.py}px` }}
                  />
                ))}
                {burst?.kind === "up" && (
                  <span
                    key={burst.key}
                    className="animate-burst absolute left-1/2 -top-1 -translate-x-1/2 text-[11px] font-semibold text-[hsl(212_92%_52%)] whitespace-nowrap pointer-events-none"
                  >
                    Good response 👍
                  </span>
                )}
              </ActionButton>

              <ActionButton
                onClick={() => handleFeedback("down")}
                label="Bad response"
                className={feedback === "down" ? "!text-destructive bg-destructive/10" : ""}
              >
                <ThumbsDown
                  className={`h-3.5 w-3.5 ${dislikeAnim ? "animate-dislike-pop" : ""}`}
                  fill={feedback === "down" ? "currentColor" : "none"}
                />
                {particles.filter((p) => p.kind === "down").map((p) => (
                  <span
                    key={p.id}
                    className="particle absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-destructive pointer-events-none"
                    style={{ ["--px" as any]: `${p.px}px`, ["--py" as any]: `${p.py}px` }}
                  />
                ))}
                {burst?.kind === "down" && (
                  <span
                    key={burst.key}
                    className="animate-burst absolute left-1/2 -top-1 -translate-x-1/2 text-[11px] font-semibold text-destructive whitespace-nowrap pointer-events-none"
                  >
                    Bad response 👎
                  </span>
                )}
              </ActionButton>

              {onRegenerate && (
                <ActionButton onClick={onRegenerate} label="Regenerate">
                  <RotateCcw className="h-3.5 w-3.5" />
                </ActionButton>
              )}

              <ActionButton
                onClick={handleSpeak}
                label={speaking ? "Stop" : "Read aloud"}
                className={speaking ? "!text-primary bg-primary/10" : ""}
              >
                {speaking ? (
                  <Square className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5" />
                )}
              </ActionButton>
            </div>
          )}
        </>
      ) : (
        <ThinkingIndicator />
      )}
    </div>
  );
};
