import { Plus, LogOut, Trash2, X, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useMemo } from "react";
import auraLogo from "@/assets/aura-logo.png";

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
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

type Group = { label: string; items: Tables<"conversations">[] };

function groupConversations(convs: Tables<"conversations">[]): Group[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const buckets: Record<string, Tables<"conversations">[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    Older: [],
  };
  for (const c of convs) {
    const t = new Date(c.updated_at as unknown as string).getTime();
    const diff = now - t;
    if (diff < day) buckets["Today"].push(c);
    else if (diff < 2 * day) buckets["Yesterday"].push(c);
    else if (diff < 7 * day) buckets["Previous 7 Days"].push(c);
    else if (diff < 30 * day) buckets["Previous 30 Days"].push(c);
    else buckets["Older"].push(c);
  }
  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export const ChatSidebar = ({ conversations, activeId, onSelect, onNew, onDelete, onSignOut, userEmail, open, onClose, collapsed, onToggleCollapsed }: Props) => {
  const groups = useMemo(() => groupConversations(conversations), [conversations]);

  return (
    <>
      {open && <div className="md:hidden fixed inset-0 bg-foreground/40 backdrop-blur-sm z-30" onClick={onClose} />}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "md:hidden" : ""}`}
      >
        {/* Brand */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-0 min-w-0">
            <img
              src={auraLogo}
              alt="AURA — Academic User Rule Assistant"
              className="h-11 w-11 object-contain flex-shrink-0 -mr-1"
            />
            <div className="flex flex-col min-w-0 leading-none">
              <span className="text-sidebar-foreground tracking-tight font-bold font-sans text-2xl leading-none">URA</span>
              <span className="text-[10px] text-sidebar-foreground/60 truncate mt-1">Academic User Rule Assistant</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground p-1 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleCollapsed}
            className="hidden md:inline-flex text-sidebar-foreground/60 hover:text-sidebar-foreground p-1 rounded-md hover:bg-sidebar-accent"
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>

        {/* New chat — pill button */}
        <div className="px-3 pb-3">
          <Button
            onClick={onNew}
            className="w-full bg-card hover:bg-card text-sidebar-foreground border border-sidebar-border justify-center gap-2 h-10 rounded-full font-medium text-sm shadow-soft"
          >
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>

        {/* Conversations grouped by date */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {groups.length === 0 ? (
            <p className="text-xs text-sidebar-foreground/50 px-3 py-2">No chats yet — ask your first question!</p>
          ) : (
            groups.map((g) => (
              <div key={g.label} className="mb-3">
                <p className="text-[11px] font-medium text-sidebar-foreground/50 px-3 pt-2 pb-1.5">{g.label}</p>
                <div className="space-y-0.5">
                  {g.items.map((c) => {
                    const isActive = activeId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => onSelect(c.id)}
                        className={`group flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg cursor-pointer transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/60 text-sidebar-foreground/85"
                        }`}
                      >
                        <span className="flex-1 truncate text-sm">{c.title}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                          className="opacity-0 group-hover:opacity-100 text-sidebar-foreground/50 hover:text-destructive transition-opacity p-1 rounded"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="h-8 w-8 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
              {userEmail?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="text-[13px] text-sidebar-foreground/80 truncate flex-1">{userEmail}</div>
            <button
              onClick={onSignOut}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
