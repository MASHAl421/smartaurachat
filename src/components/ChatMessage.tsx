import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GraduationCap, User as UserIcon } from "lucide-react";

interface Props {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export const ChatMessage = ({ role, content, streaming }: Props) => {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 sm:gap-4 animate-fade-in-up ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-gradient-hero flex items-center justify-center shadow-soft">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "order-1" : ""}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border border-border rounded-tl-sm shadow-soft"
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : content ? (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              {streaming && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm" />}
            </div>
          ) : (
            <div className="dot-pulse flex gap-1.5 py-1">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="h-2 w-2 rounded-full bg-primary" />
            </div>
          )}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-secondary flex items-center justify-center order-2">
          <UserIcon className="h-5 w-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
