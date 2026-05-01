import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import auraLogo from "@/assets/aura-logo.png";

type Mode = "signin" | "signup" | "forgot";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [signupSent, setSignupSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        // If session exists, auto-confirm is on → go straight in.
        if (data.session) {
          navigate("/");
        } else {
          // Confirmation email sent — show inline notice.
          setSignupSent(true);
        }
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        setBusy(false);
        return;
      }
      if (result.redirected) return; // browser redirects
      navigate("/");
    } catch (err: any) {
      toast.error(err?.message || "Google sign-in failed");
      setBusy(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setSignupSent(false);
    setResetSent(false);
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
          {/* Tabs (hidden in forgot mode) */}
          {mode !== "forgot" && (
            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === "signin" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
              >Sign in</button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === "signup" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
              >Sign up</button>
            </div>
          )}

          {/* Forgot password header */}
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </button>
          )}

          {/* Signup confirmation notice */}
          {signupSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
                Click it to activate your account, then sign in.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setSignupSent(false); switchMode("signin"); }}
                className="w-full mt-2"
              >
                Back to sign in
              </Button>
            </div>
          ) : resetSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Reset link sent</h3>
              <p className="text-sm text-muted-foreground">
                If an account exists for <span className="font-medium text-foreground">{email}</span>,
                you'll receive a password reset link shortly.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setResetSent(false); switchMode("signin"); }}
                className="w-full mt-2"
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              {/* Google sign-in (not on forgot mode) */}
              {mode !== "forgot" && (
                <>
                  <Button
                    type="button"
                    onClick={handleGoogle}
                    disabled={busy}
                    variant="outline"
                    className="w-full h-11 mb-4 gap-2 font-medium"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </Button>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">or with email</span>
                    </div>
                  </div>
                </>
              )}

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
                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input id="password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
                  </div>
                )}
                <Button type="submit" disabled={busy} className="w-full bg-gradient-hero hover:opacity-95 text-primary-foreground shadow-soft h-11">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"
                  )}
                </Button>
              </form>
            </>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to follow the college Code of Conduct.
        </p>
      </div>
    </div>
  );
}
