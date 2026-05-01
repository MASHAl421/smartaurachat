import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import auraLogo from "@/assets/aura-logo.png";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <img
            src={auraLogo}
            alt="AURA logo"
            className="inline-block h-24 w-24 object-contain mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground">Academic User Rule Assistant</h1>
          <p className="text-muted-foreground mt-2">Sign in to chat with AURA — your AI policy guide</p>
        </div>

        <Card className="p-6 shadow-elegant border-border/50">
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === "signin" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
            >Sign in</button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === "signup" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
            >Sign up</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="mashalkhan@gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-hero hover:opacity-95 text-primary-foreground shadow-soft h-11">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (mode === "signin" ? "Sign in" : "Create account")}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to follow the college Code of Conduct.
        </p>
      </div>
    </div>
  );
}
