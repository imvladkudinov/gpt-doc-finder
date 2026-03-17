import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { ButtonLarge } from "@/components/ui/ButtonLarge";
import { appToast } from "@/lib/app-toast";
import { supabase } from "@/integrations/supabase/client";

const GoogleIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M21.805 10.023H12v3.955h5.607c-.241 1.272-.965 2.35-2.057 3.071v2.55h3.327c1.947-1.792 3.068-4.432 3.068-7.576 0-.669-.06-1.311-.14-2Z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.78 0 5.112-.92 6.816-2.488l-3.327-2.55c-.924.62-2.105.987-3.489.987-2.68 0-4.95-1.81-5.762-4.244H2.798v2.63A9.997 9.997 0 0 0 12 22Z"
      fill="#34A853"
    />
    <path
      d="M6.238 13.705A5.996 5.996 0 0 1 5.916 12c0-.592.102-1.166.283-1.705V7.665H2.798A9.997 9.997 0 0 0 2 12c0 1.61.386 3.13 1.07 4.335l3.168-2.63Z"
      fill="#FBBC05"
    />
    <path
      d="M12 6.05c1.512 0 2.87.52 3.94 1.542l2.956-2.956C17.108 2.97 14.776 2 12 2a9.997 9.997 0 0 0-9.202 5.665l3.401 2.63C7.05 7.86 9.32 6.05 12 6.05Z"
      fill="#EA4335"
    />
  </svg>
);

const PageAuth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/plants`,
      },
    });

    if (authError) {
      appToast.error("Login failed");
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      appToast.error("Enter email and password");
      return;
    }

    setLoading(true);

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        appToast.error("Wrong email or password");
        setLoading(false);
        return;
      }

      navigate("/plants", { replace: true });
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      appToast.error("Sign up failed");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <div className="mx-auto w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-foreground">Welcome</h1>
            <p className="text-sm text-muted-foreground">Start treating your plants on another level</p>
          </div>

          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[52px] rounded-none border-0 border-b border-icon-secondary bg-transparent px-0 text-left shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Input
              type="password"
              placeholder="Password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[52px] rounded-none border-0 border-b border-icon-secondary bg-transparent px-0 text-left shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <button
              type="button"
              onClick={() => setMode((prev) => (prev === "signin" ? "signup" : "signin"))}
              className="pt-2 text-sm font-bold text-primary transition-opacity hover:opacity-70"
            >
              {mode === "signin" ? "Sign up instead" : "Log in instead"}
            </button>
          </div>

          <div className="space-y-3 pt-3">
            <ButtonLarge onClick={handleEmailAuth} disabled={loading}>
              {mode === "signin" ? "Sign in" : "Sign up"}
            </ButtonLarge>
            <div className="mx-3 flex items-center gap-3 text-sm text-text-secondary opacity-50">
              <div className="h-px flex-1 bg-icon-secondary" />
              <span>or</span>
              <div className="h-px flex-1 bg-icon-secondary" />
            </div>
            <ButtonLarge variant="secondary" onClick={handleGoogleAuth} disabled={loading}>
              <span className="flex items-center gap-2">
                <GoogleIcon />
                <span>Continue with Google</span>
              </span>
            </ButtonLarge>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PageAuth;
