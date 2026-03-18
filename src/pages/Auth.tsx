import ComponentGlassBackButton from "../components/GlassBackButton";
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
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Navbar title logic
  let navbarTitle = "Sign in";
  if (mode === "signup") navbarTitle = "Sign up";
  if (mode === "forgot") navbarTitle = "Password recovery";

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

      // Wait for session update, then redirect
      setTimeout(() => navigate("/plants", { replace: true }), 100);
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
    <PageTransition key={mode}>
      <div className="min-h-screen bg-background px-6 py-10 flex flex-col">
        <div className="fixed top-6 left-6 right-6 z-40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === "forgot" ? (
                <ComponentGlassBackButton to={undefined} onClick={() => setMode("signin")} />
            ) : (
              <ComponentGlassBackButton />
            )}
            <h1 className="font-serif text-[20px] font-bold text-foreground">
              {navbarTitle}
            </h1>
          </div>
          {mode !== "forgot" && (
            <button
              type="button"
              onClick={() => setMode((prev) => (prev === "signin" ? "signup" : "signin"))}
              className="flex items-center justify-center rounded-full px-4 h-10 font-bold text-primary text-sm transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                backdropFilter: "blur(40px) saturate(1.8)",
                WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="mx-auto w-full max-w-md space-y-6 text-center">
            <div className="space-y-3">
            {mode === "forgot" ? (
              <>
                <Input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[52px] rounded-none border-0 border-b border-icon-secondary bg-transparent px-0 text-left shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 opacity-70"
                />
                <ButtonLarge
                  onClick={() => {
                    if (!email.trim()) {
                      appToast.error("Enter your email");
                      return;
                    }
                    setLoading(true);
                    supabase.auth.resetPasswordForEmail(email.trim()).then(({ error }) => {
                      setLoading(false);
                      if (error) {
                        appToast.error("No account found for this email");
                        return;
                      }
                      appToast.success("May god help you");
                      setMode("signin");
                    });
                  }}
                  disabled={loading}
                  className="mt-6"
                >
                  Send email
                </ButtonLarge>
              </>
            ) : (
              <>
                <Input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[52px] rounded-none border-0 border-b border-icon-secondary bg-transparent px-0 text-left shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 opacity-70"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[52px] rounded-none border-0 border-b border-icon-secondary bg-transparent px-0 text-left shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 opacity-70"
                />
                <div className="flex flex-row justify-center gap-6 mt-1">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-sm font-bold text-primary transition-opacity hover:opacity-70"
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}
          </div>

          {mode !== "forgot" && (
            <div className="space-y-3 pt-3">
              <ButtonLarge onClick={handleEmailAuth} disabled={loading}>
                {mode === "signin" ? "Sign in" : "Sign up"}
              </ButtonLarge>
              <div className="my-2 flex items-center justify-center gap-2">
                <div className="flex-1 h-px bg-border opacity-70" />
                <span className="text-xs text-muted-foreground font-semibold opacity-70">or</span>
                <div className="flex-1 h-px bg-border opacity-70" />
              </div>
              <ButtonLarge
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="secondary"
                className="mt-2 flex items-center justify-center gap-2"
              >
                <GoogleIcon />
                Continue with Google
              </ButtonLarge>
            </div>
          )}
          {/* Remove button next to forgot password, do not render anything here */}
          {/* Removed: bottom sign up instead button */}
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default PageAuth;
