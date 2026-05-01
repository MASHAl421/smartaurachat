import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Menu, ArrowUp, ScrollText, Scale, ShieldAlert, GraduationCap } from "lucide-react";
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
  const skipLoadRef = useRef<string | null>(null); // conv id to skip auto-loading (just created locally)

  useEffect(() => { if (user) loadConversations(); }, [user]);
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    if (skipLoadRef.current === activeId) { skipLoadRef.current = null; return; }
    loadMessages(activeId);
  }, [activeId]);
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
      skipLoadRef.current = convId; // prevent the activeId effect from wiping optimistic UI
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

      // ── Smooth typewriter: server fills `fullText`, RAF loop reveals chars ──
      let fullText = "";
      let revealed = 0;
      let streamDone = false;

      const tick = () => {
        const remaining = fullText.length - revealed;
        if (remaining > 0) {
          // Reveal faster if we're falling behind, slower if close to live edge.
          // Aim for ~60fps with adaptive char count.
          const step = Math.max(1, Math.ceil(remaining / 18));
          revealed = Math.min(fullText.length, revealed + step);
          setMessages([...newMessages, { role: "assistant", content: fullText.slice(0, revealed) }]);
        }
        if (!streamDone || revealed < fullText.length) {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);

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
            if (delta) fullText += delta;
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
      streamDone = true;

      // Wait for typewriter to finish revealing before persisting
      await new Promise<void>((resolve) => {
        const check = () => {
          if (revealed >= fullText.length) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });

      const assistantText = fullText;
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

      <main className="flex-1 flex flex-col min-w-0 relative bg-background">
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 -ml-1 rounded-md hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-foreground text-background flex items-center justify-center font-serif font-bold text-[13px]">A</div>
            <h1 className="font-serif font-semibold text-foreground tracking-tight text-[17px]">Aura Chat</h1>
          </div>
          <span className="ml-auto text-[11px] uppercase tracking-[0.12em] text-muted-foreground hidden sm:flex items-center gap-1.5 font-sans font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Online
          </span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-12 space-y-6 sm:space-y-8">
            {messages.length === 0 ? (
              <div className="pt-6 sm:pt-16 animate-fade-in-up">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-sans font-medium mb-4">
                  An educational assistant
                </div>
                <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-foreground leading-[1.05] mb-5">
                  Knowledge,<br/>
                  <span className="italic text-primary">precisely answered.</span>
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg max-w-xl mb-10 font-sans leading-relaxed">
                  Ask anything about college policies, conduct, and academics. Sourced answers, clearly written.
                </p>

                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-sans font-medium mb-3">
                  Examples
                </div>
                <div className="grid sm:grid-cols-2 gap-px bg-border border border-border rounded-lg overflow-hidden">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s.text)}
                      className="text-left p-4 sm:p-5 bg-card hover:bg-muted transition-colors flex items-start gap-3 group"
                    >
                      <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground mt-0.5 flex-shrink-0 transition-colors" />
                      <span className="font-serif text-[15px] text-foreground leading-snug">{s.text}</span>
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

        <div className="bg-gradient-to-t from-background via-background to-transparent pt-6 pb-3 sm:pb-5 px-3 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-card border-2 border-border rounded-xl focus-within:border-foreground transition-colors">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask a question…"
                disabled={sending}
                rows={1}
                className="border-0 bg-transparent focus-visible:ring-0 resize-none max-h-40 py-3.5 pl-4 pr-14 text-[15px] placeholder:text-muted-foreground/70 font-sans"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                size="icon"
                className="absolute right-2 bottom-2 h-9 w-9 rounded-md bg-foreground text-background hover:bg-foreground/90 disabled:opacity-25 disabled:bg-foreground"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/80 text-center mt-3 font-sans">
              Aura Chat may make mistakes — verify important matters with college administration.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
