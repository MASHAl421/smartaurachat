import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Menu, ArrowUp, Sparkles, ScrollText, Scale, ShieldAlert, GraduationCap } from "lucide-react";
import { toast } from "sonner";

type Msg = { id?: string; role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  { icon: ScrollText, text: "What is the dress code at college?" },
  { icon: ShieldAlert, text: "What counts as misconduct?" },
  { icon: Scale, text: "What are the possible penalties for cheating?" },
  { icon: GraduationCap, text: "Can students take part in politics?" },
];

const Index = () => {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<Tables<"conversations">[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) loadConversations(); }, [user]);
  useEffect(() => { if (activeId) loadMessages(activeId); else setMessages([]); }, [activeId]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  async function loadConversations() {
    const { data } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false });
    setConversations(data || []);
  }

  async function loadMessages(id: string) {
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at");
    setMessages((data || []).map(m => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })));
  }

  async function newChat() {
    setActiveId(null);
    setMessages([]);
    setSidebarOpen(false);
  }

  async function deleteConversation(id: string) {
    await supabase.from("conversations").delete().eq("id", id);
    if (activeId === id) { setActiveId(null); setMessages([]); }
    loadConversations();
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending || !user) return;
    setInput("");
    setSending(true);

    let convId = activeId;
    // Create conversation if first message
    if (!convId) {
      const title = text.slice(0, 50) + (text.length > 50 ? "…" : "");
      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title })
        .select().single();
      if (error || !data) { toast.error("Couldn't start chat"); setSending(false); return; }
      convId = data.id;
      setActiveId(convId);
      loadConversations();
    }

    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    // Persist user message
    await supabase.from("messages").insert({
      conversation_id: convId, user_id: user.id, role: "user", content: text,
    });

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limit reached. Try again shortly.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Add credits in workspace settings.");
        else toast.error("Failed to get response");
        setMessages(newMessages);
        setSending(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages([...newMessages, { role: "assistant", content: assistantText }]);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Persist assistant message
      if (assistantText) {
        await supabase.from("messages").insert({
          conversation_id: convId, user_id: user.id, role: "assistant", content: assistantText,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Connection error");
      setMessages(newMessages);
    } finally {
      setSending(false);
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setSidebarOpen(false); }}
        onNew={newChat}
        onDelete={deleteConversation}
        onSignOut={() => supabase.auth.signOut()}
        userEmail={user.email}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 relative bg-gradient-glow">
        <header className="h-14 border-b border-border/60 flex items-center px-4 gap-3 bg-background/70 backdrop-blur-xl sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-foreground tracking-tight">College Policy Assistant</h1>
          <span className="ml-auto text-xs text-muted-foreground hidden sm:flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Online
          </span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center pt-8 sm:pt-20 animate-fade-in-up">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero animate-gradient shadow-elegant mb-7">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
                  <span className="text-gradient">Hello there.</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto mb-12">
                  How can I help you today?
                </p>
                <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s.text)}
                      className="text-left p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm hover:border-primary/40 hover:bg-card hover:-translate-y-0.5 hover:shadow-elegant transition-all duration-200 flex items-start gap-3 group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center flex-shrink-0 transition-colors">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground/90 leading-relaxed">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <ChatMessage
                  key={i}
                  role={m.role}
                  content={m.content}
                  streaming={sending && i === messages.length - 1 && m.role === "assistant"}
                />
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-t from-background via-background to-transparent pt-6 pb-3 sm:pb-4 px-3 sm:px-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-card border border-border rounded-3xl shadow-soft focus-within:border-primary/50 focus-within:shadow-elegant transition-all px-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask Policy AI anything…"
                disabled={sending}
                rows={1}
                className="border-0 bg-transparent focus-visible:ring-0 resize-none max-h-40 py-4 pl-3 pr-14 text-[15px] placeholder:text-muted-foreground/70"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                size="icon"
                className="absolute right-2.5 bottom-2.5 h-9 w-9 rounded-full bg-gradient-hero animate-gradient hover:opacity-90 disabled:opacity-30 disabled:bg-muted disabled:bg-none shadow-soft"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/80 text-center mt-2.5">
              Policy AI may make mistakes — verify important matters with college administration.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
