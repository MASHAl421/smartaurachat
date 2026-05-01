import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Props {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  onRegenerate?: () => void;
}

type Feedback = "up" | "down" | null;

const ActionButton = ({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
      active ? "text-foreground bg-muted" : ""
    }`}
  >
    {children}
  </button>
);

export const ChatMessage = ({ role, content, streaming, onRegenerate }: Props) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

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

  const handleFeedback = (val: "up" | "down") => {
    setFeedback((prev) => (prev === val ? null : val));
  };

  if (isUser) {
    return (
      <div className="group flex flex-col items-end animate-fade-in-up">
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
    <div className="animate-fade-in-up w-full">
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
              <ActionButton onClick={() => handleFeedback("up")} label="Good response" active={feedback === "up"}>
                <ThumbsUp className="h-3.5 w-3.5" />
              </ActionButton>
              <ActionButton onClick={() => handleFeedback("down")} label="Bad response" active={feedback === "down"}>
                <ThumbsDown className="h-3.5 w-3.5" />
              </ActionButton>
              {onRegenerate && (
                <ActionButton onClick={onRegenerate} label="Regenerate">
                  <RotateCcw className="h-3.5 w-3.5" />
                </ActionButton>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="dot-pulse flex gap-1.5 py-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
};
