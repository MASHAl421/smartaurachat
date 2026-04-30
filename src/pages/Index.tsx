import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Menu, Send, GraduationCap, ScrollText, Scale, ShieldAlert } from "lucide-react";
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

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-card/80 backdrop-blur">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-foreground">College Policy Assistant</h1>
          <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">Powered by AI · Trained on official policies</span>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-5">
            {messages.length === 0 ? (
              <div className="text-center pt-8 sm:pt-16 animate-fade-in-up">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-hero shadow-elegant mb-6">
                  <GraduationCap className="h-10 w-10 text-primary-foreground" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">How can I help you today?</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-10">
                  Ask anything about the college Code of Conduct, penalties, hostel rules, or general college life.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s.text)}
                      className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-soft transition-all flex items-start gap-3 group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-secondary group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground/90">{s.text}</span>
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

        <div className="border-t border-border bg-card/80 backdrop-blur p-3 sm:p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-background border border-border rounded-2xl shadow-soft focus-within:border-primary/50 focus-within:shadow-elegant transition-all">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about any college policy…"
                disabled={sending}
                rows={1}
                className="border-0 bg-transparent focus-visible:ring-0 resize-none max-h-40 py-3.5 pr-14"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                size="icon"
                className="absolute right-2 bottom-2 h-9 w-9 rounded-xl bg-gradient-hero hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              AI may occasionally make mistakes — verify important matters with college administration.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
