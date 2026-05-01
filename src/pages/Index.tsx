import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Menu, ArrowUp, Square, ScrollText, Scale, ShieldAlert, GraduationCap, ChevronDown, SquarePen, Pencil, Trash2, Paperclip, X, FileText } from "lucide-react";
import auraLogo from "@/assets/aura-logo.png";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Attachment = { url: string; name: string; type: string };
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down">>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const skipLoadRef = useRef<string | null>(null); // conv id to skip auto-loading (just created locally)
  const abortRef = useRef<AbortController | null>(null);

  function stopGeneration() {
    abortRef.current?.abort();
  }

  // Auto-resize textarea: grow from 1 → up to 7 lines, then scroll.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 20;
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const maxHeight = lineHeight * 7 + paddingY;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    // Always allow scroll once max is reached; CSS keeps scrollbar invisible until user actually scrolls.
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  useEffect(() => { if (user) loadConversations(); }, [user]);
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    if (skipLoadRef.current === activeId) { skipLoadRef.current = null; return; }
    loadMessages(activeId);
  }, [activeId]);
  // No auto-scroll. The user controls scrolling.

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  async function loadConversations() {
    const { data } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false });
    setConversations(data || []);
  }

  async function loadMessages(id: string) {
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at");
    const msgs = (data || []).map(m => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content }));
    setMessages(msgs);
    // Load feedback for assistant messages
    const ids = msgs.filter(m => m.role === "assistant" && m.id).map(m => m.id!) ;
    if (ids.length) {
      const { data: fb } = await supabase.from("message_feedback").select("message_id, rating").in("message_id", ids);
      const map: Record<string, "up" | "down"> = {};
      (fb || []).forEach((r: any) => { map[r.message_id] = r.rating; });
      setFeedbackMap(map);
    } else {
      setFeedbackMap({});
    }
  }

  async function newChat() {
    setActiveId(null);
    setMessages([]);
    setSuggestions([]);
    setPendingAttachments([]);
    setSidebarOpen(false);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || !user) return;
    if (pendingAttachments.length + files.length > 4) {
      toast.error("Up to 4 files at a time");
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is over 10MB`);
          continue;
        }
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("chat-attachments").upload(path, file, {
          contentType: file.type || "application/octet-stream",
        });
        if (error) { toast.error(`Upload failed: ${file.name}`); continue; }
        const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);
        setPendingAttachments((prev) => [...prev, { url: data.publicUrl, name: file.name, type: file.type || "application/octet-stream" }]);
      }
    } finally {
      setUploading(false);
    }
  }

  function removeAttachment(idx: number) {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx));
  }


  async function deleteConversation(id: string) {
    await supabase.from("conversations").delete().eq("id", id);
    if (activeId === id) { setActiveId(null); setMessages([]); }
    loadConversations();
  }

  async function renameConversation(id: string) {
    const current = conversations.find(c => c.id === id);
    const next = window.prompt("Rename chat", current?.title || "");
    if (!next || !next.trim() || next === current?.title) return;
    const { error } = await supabase.from("conversations").update({ title: next.trim() }).eq("id", id);
    if (error) { toast.error("Couldn't rename"); return; }
    loadConversations();
  }

  async function regenerateLast() {
    if (sending || !user || !activeId) return;
    // Find last user message
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) return;
    const lastUser = messages[lastUserIdx];
    const previousAnswer =
      messages[messages.length - 1]?.role === "assistant"
        ? messages[messages.length - 1].content
        : "";
    // Delete previous assistant message from DB
    const lastAssistant = messages[messages.length - 1];
    if (lastAssistant?.role === "assistant" && lastAssistant.id) {
      await supabase.from("messages").delete().eq("id", lastAssistant.id);
    }
    // Immediately hide the old answer & show thinking dots
    setSuggestions([]);
    setMessages([...messages.slice(0, lastUserIdx + 1), { role: "assistant", content: "" }]);
    await sendMessage({
      overrideText: lastUser.content,
      baseHistory: messages.slice(0, lastUserIdx), // exclude the user msg (sendMessage re-adds it)
      skipPersistUser: true,
      regenerate: true,
      previousAnswer,
    });
  }

  async function fetchSuggestions(history: Msg[]) {
    try {
      setLoadingSuggestions(true);
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mode: "suggestions", messages: history }),
      });
      if (!resp.ok) { setSuggestions([]); return; }
      const data = await resp.json();
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function sendMessage(opts?: {
    overrideText?: string;
    baseHistory?: Msg[];
    skipPersistUser?: boolean;
    regenerate?: boolean;
    previousAnswer?: string;
  }) {
    const rawText = (opts?.overrideText ?? input).trim();
    const attachments = opts?.overrideText ? [] : pendingAttachments;
    if (!rawText && attachments.length === 0) return;
    if (sending || !user) return;
    if (!opts?.overrideText) { setInput(""); setPendingAttachments([]); }
    setSending(true);
    setSuggestions([]);

    // Compose final user message text with attachment references (markdown)
    let text = rawText;
    if (attachments.length > 0) {
      const refs = attachments.map((a) => {
        const isImg = a.type.startsWith("image/");
        return isImg ? `![${a.name}](${a.url})` : `[📎 ${a.name}](${a.url})`;
      }).join("\n");
      text = (rawText ? rawText + "\n\n" : "") + refs;
    }

    let convId = activeId;
    // Create conversation if first message
    if (!convId) {
      const titleSrc = rawText || attachments[0]?.name || "New chat";
      const title = titleSrc.slice(0, 50) + (titleSrc.length > 50 ? "…" : "");
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

    const baseMessages = opts?.baseHistory ?? messages;
    const userMsg: Msg = { role: "user", content: text };
    const newMessages = [...baseMessages, userMsg];
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    // Smoothly scroll the new user message just under the header.
    // Custom rAF easing for a softer, more polished feel than native smooth.
    requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container) return;
      const userEls = container.querySelectorAll<HTMLElement>("[data-role='user']");
      const lastUser = userEls[userEls.length - 1];
      if (!lastUser) return;
      const offset = 72; // breathing room below header
      const targetTop = Math.max(0, lastUser.offsetTop - offset);
      const startTop = container.scrollTop;
      const distance = targetTop - startTop;
      if (Math.abs(distance) < 2) return;
      const duration = 650; // ms — slow enough to feel smooth, quick enough to stay snappy
      const startTime = performance.now();
      // easeInOutCubic — gentle acceleration & deceleration
      const ease = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        container.scrollTop = startTop + distance * ease(t);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    // Persist user message (skip when regenerating — user msg already in DB)
    let userMsgId: string | null = null;
    if (!opts?.skipPersistUser) {
      const { data: insertedUser } = await supabase.from("messages").insert({
        conversation_id: convId, user_id: user.id, role: "user", content: text,
      }).select().single();
      userMsgId = insertedUser?.id ?? null;
    }

    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          regenerate: !!opts?.regenerate,
          previousAnswer: opts?.previousAnswer,
        }),
        signal: controller.signal,
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
      let aborted = false;
      try {
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
      } catch (e: any) {
        if (e?.name === "AbortError" || controller.signal.aborted) {
          aborted = true;
        } else {
          throw e;
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
      // Persist assistant message (even if user aborted, save partial)
      if (assistantText) {
        const { data: insertedAsst } = await supabase.from("messages").insert({
          conversation_id: convId, user_id: user.id, role: "assistant", content: assistantText,
        }).select().single();
        if (insertedAsst?.id) {
          // Attach id to the last assistant message in state so feedback can persist
          setMessages((prev) => {
            const next = [...prev];
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].role === "assistant") { next[i] = { ...next[i], id: insertedAsst.id }; break; }
            }
            return next;
          });
        }
        if (!aborted) {
          // Fire-and-forget: fetch follow-up suggestions
          fetchSuggestions([...newMessages, { role: "assistant", content: assistantText }]);
        }
      } else if (aborted) {
        // Stopped before any token arrived — drop user msg too so the next prompt
        // doesn't get answered together with this orphaned one.
        if (userMsgId) await supabase.from("messages").delete().eq("id", userMsgId);
        setMessages(baseMessages);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // Stopped before any response started — clean up the orphan user msg.
        if (userMsgId) await supabase.from("messages").delete().eq("id", userMsgId);
        setMessages(baseMessages);
      } else {
        console.error(err);
        toast.error("Connection error");
        setMessages(newMessages);
      }
    } finally {
      abortRef.current = null;
      setSending(false);
    }
  }


  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-[100dvh] flex bg-background overflow-hidden">
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
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(v => !v)}
      />

      <main className="flex-1 flex flex-col min-w-0 relative bg-background">
        {/* Always-visible sidebar toggle when there's no header (e.g. new chat / empty state) */}
        {!activeId && (
          <>
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden absolute top-3 left-3 z-20 p-2 rounded-md bg-background/80 backdrop-blur hover:bg-muted border border-border/60"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="hidden md:inline-flex absolute top-3 left-3 z-20 p-2 rounded-md bg-background/80 backdrop-blur hover:bg-muted border border-border/60"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
          </>
        )}
        {activeId && (
          <header className="h-11 border-b border-border/70 flex items-center px-3 gap-2 bg-background/95 backdrop-blur-xl flex-shrink-0 z-20 sticky top-0 md:static">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 -ml-1 rounded-md hover:bg-muted" aria-label="Open sidebar">
              <Menu className="h-5 w-5" />
            </button>
            {sidebarCollapsed && (
              <button onClick={() => setSidebarCollapsed(false)} className="hidden md:inline-flex p-1.5 -ml-1 rounded-md hover:bg-muted" aria-label="Open sidebar">
                <Menu className="h-5 w-5" />
              </button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted text-sm font-medium text-foreground/90 max-w-[60%] truncate outline-none">
                <span className="truncate">
                  {conversations.find(c => c.id === activeId)?.title || "Chat"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem onClick={() => renameConversation(activeId)}>
                  <Pencil className="h-4 w-4 mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteConversation(activeId)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={newChat}
              className="ml-auto p-1.5 rounded-md hover:bg-muted text-foreground/80"
              aria-label="New chat"
              title="New chat"
            >
              <SquarePen className="h-[18px] w-[18px]" />
            </button>
          </header>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className={`max-w-3xl mx-auto px-4 sm:px-8 ${messages.length === 0 ? "min-h-full flex flex-col justify-center py-4 sm:py-8" : "py-6 sm:py-10 space-y-6"}`}>
            {messages.length === 0 ? (
              <div className="animate-fade-in-up">
                <div className="text-center mb-5 sm:mb-10">
                  <img
                    src={auraLogo}
                    alt="AURA logo"
                    className="inline-block h-14 w-14 sm:h-20 sm:w-20 object-contain mb-3 sm:mb-5"
                  />
                  <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground mb-2">
                    Hey there! How can I help you today?
                  </h2>
                  <p className="text-muted-foreground text-[14px] sm:text-[15px] max-w-md mx-auto">
                    Ask anything about college policies, conduct, or academics.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s.text)}
                      className="text-left p-3 sm:p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-secondary/40 hover:-translate-y-0.5 hover:shadow-elegant transition-all duration-200 flex items-center sm:items-start gap-3 group"
                    >
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-secondary group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[13px] sm:text-[14px] text-foreground/90 leading-relaxed">{s.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => {
                const isLastAssistant = m.role === "assistant" && i === messages.length - 1;
                return (
                  <ChatMessage
                    key={m.id || i}
                    role={m.role}
                    content={m.content}
                    streaming={sending && isLastAssistant}
                    onRegenerate={isLastAssistant && !sending ? regenerateLast : undefined}
                    messageId={m.id}
                    initialFeedback={m.id ? (feedbackMap[m.id] ?? null) : null}
                  />
                );
              })
            )}

            {/* Follow-up suggestion chips */}
            {!sending && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (suggestions.length > 0 || loadingSuggestions) && (
              <div className="pt-2 flex flex-wrap gap-2 animate-fade-in-up">
                {loadingSuggestions && suggestions.length === 0 ? (
                  <>
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-8 w-40 rounded-full bg-muted animate-pulse" />
                    ))}
                  </>
                ) : (
                  suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); }}
                      className="text-[13px] px-3.5 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-secondary/50 text-foreground/85 transition-colors"
                    >
                      {s}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Spacer only while AI is responding — lets the latest user message scroll to the top.
                Removed once the response completes so no empty space sits below suggestions. */}
            {sending && <div aria-hidden className="h-[60vh]" />}
          </div>
        </div>

        <div className="bg-gradient-to-t from-background via-background to-transparent pt-2 sm:pt-6 pb-3 sm:pb-5 px-3 sm:px-6 flex-shrink-0 sticky bottom-0 md:static z-10">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-3xl shadow-soft focus-within:border-primary/40 focus-within:shadow-elegant transition-all px-2 py-1.5">
              {/* Attachment chips */}
              {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2 pt-2 pb-1">
                  {pendingAttachments.map((a, i) => {
                    const isImg = a.type.startsWith("image/");
                    return (
                      <div key={i} className="relative group flex items-center gap-2 bg-secondary/60 border border-border rounded-xl pl-1.5 pr-7 py-1 max-w-[200px]">
                        {isImg ? (
                          <img src={a.url} alt={a.name} className="h-9 w-9 rounded-md object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <span className="text-[12px] text-foreground/80 truncate">{a.name}</span>
                        <button
                          onClick={() => removeAttachment(i)}
                          className="absolute top-1/2 -translate-y-1/2 right-1 p-0.5 rounded-full bg-foreground/70 text-background hover:bg-foreground"
                          aria-label="Remove attachment"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                  {uploading && (
                    <div className="text-[12px] text-muted-foreground self-center">Uploading…</div>
                  )}
                </div>
              )}

              <div className="flex items-end gap-2 pl-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending}
                  className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 disabled:opacity-40"
                  aria-label="Attach file"
                  title="Attach image or PDF"
                >
                  <Paperclip className="h-[18px] w-[18px]" />
                </button>

                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    el.classList.add("is-scrolling");
                    window.clearTimeout((el as any)._scrollHideTimer);
                    (el as any)._scrollHideTimer = window.setTimeout(() => {
                      el.classList.remove("is-scrolling");
                    }, 800);
                  }}
                  placeholder="Message AURA"
                  rows={1}
                  className="input-scroll border-0 bg-transparent focus-visible:ring-0 resize-none p-0 py-2 text-[15px] leading-5 placeholder:text-muted-foreground/70 shadow-none min-h-[20px] flex-1 overflow-hidden"
                />
                {sending ? (
                  <Button
                    onClick={stopGeneration}
                    size="icon"
                    aria-label="Stop generating"
                    className="h-9 w-9 rounded-full bg-foreground text-background hover:bg-foreground/85 flex-shrink-0 animate-fade-in-up"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() && pendingAttachments.length === 0}
                    size="icon"
                    aria-label="Send"
                    className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:bg-muted disabled:text-muted-foreground flex-shrink-0"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/80 text-center mt-3">
              Aura is AI and can make mistakes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
