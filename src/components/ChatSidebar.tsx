import { Plus, MessageSquare, LogOut, GraduationCap, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";

interface Props {
  conversations: Tables<"conversations">[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onSignOut: () => void;
  userEmail?: string;
  open: boolean;
  onClose: () => void;
}

export const ChatSidebar = ({ conversations, activeId, onSelect, onNew, onDelete, onSignOut, userEmail, open, onClose }: Props) => {
  return (
    <>
      {open && <div className="md:hidden fixed inset-0 bg-foreground/40 z-30" onClick={onClose} />}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-semibold leading-none">Policy AI</h2>
              <p className="text-[11px] text-sidebar-foreground/60 mt-1">College Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          <Button onClick={onNew} className="w-full bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground border border-sidebar-border justify-start gap-2 h-10">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 px-2 py-2">Recent</p>
          {conversations.length === 0 ? (
            <p className="text-xs text-sidebar-foreground/50 px-2">No chats yet — ask your first question!</p>
          ) : conversations.map(c => (
            <div
              key={c.id}
              className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                activeId === c.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
              }`}
              onClick={() => onSelect(c.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0 text-sidebar-foreground/60" />
              <span className="flex-1 truncate text-sm">{c.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className="opacity-0 group-hover:opacity-100 text-sidebar-foreground/50 hover:text-destructive transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 px-2 mb-2 truncate">{userEmail}</div>
          <Button onClick={onSignOut} variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
    </>
  );
};
