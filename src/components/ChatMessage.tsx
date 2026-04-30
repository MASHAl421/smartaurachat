import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, User as UserIcon } from "lucide-react";

interface Props {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export const ChatMessage = ({ role, content, streaming }: Props) => {
  const isUser = role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in-up">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tr-md px-4 py-3 shadow-soft">
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{content}</p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-3 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 animate-fade-in-up">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-hero animate-gradient flex items-center justify-center shadow-soft">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        {content ? (
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            {streaming && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse rounded-sm align-middle" />}
          </div>
        ) : (
          <div className="dot-pulse flex gap-1.5 py-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="h-2 w-2 rounded-full bg-primary" />
          </div>
        )}
      </div>
    </div>
  );
};
