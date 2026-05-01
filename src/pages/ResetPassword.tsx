import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import auraLogo from "@/assets/aura-logo.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash and emits PASSWORD_RECOVERY.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setValidSession(true);
      }
    });
    // Fallback: if a session already exists (link just clicked), mark valid.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      else if (!window.location.hash.includes("access_token")) setValidSession(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      // Sign out so user must log in with new password.
      await supabase.auth.signOut();
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Couldn't update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <img src={auraLogo} alt="AURA logo" className="inline-block h-20 w-20 object-contain mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>
        </div>

        <Card className="p-6 shadow-elegant border-border/50">
          {done ? (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Password updated</h3>
              <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
            </div>
          ) : validSession === false ? (
            <div className="text-center py-4 space-y-3">
              <h3 className="font-semibold text-foreground">Invalid or expired link</h3>
              <p className="text-sm text-muted-foreground">
                This reset link is no longer valid. Please request a new one.
              </p>
              <Button onClick={() => navigate("/auth")} variant="outline" className="w-full mt-2">
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password" type="password" required minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm" type="password" required minLength={6}
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
              <Button type="submit" disabled={busy || !validSession} className="w-full bg-gradient-hero hover:opacity-95 text-primary-foreground shadow-soft h-11">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
