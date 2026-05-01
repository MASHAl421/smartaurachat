import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        <div className="max-w-[92%] sm:max-w-[80%]">
          <div className="bg-foreground text-background rounded-2xl rounded-tr-sm px-4 py-2.5 sm:px-5 sm:py-3">
            <p className="whitespace-pre-wrap leading-relaxed text-[14.5px] sm:text-[15px] font-sans">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up w-full">
      {content ? (
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
