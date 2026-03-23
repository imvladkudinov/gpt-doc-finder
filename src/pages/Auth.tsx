import ComponentGlassBackButton from "../components/GlassBackButton";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { IconMail, IconLock } from "@tabler/icons-react";
import { ButtonLarge } from "@/components/ui/ButtonLarge";
import { appToast } from "@/lib/app-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
  const [showForgotSheet, setShowForgotSheet] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Autofill detection: only auto-submit if both fields are filled instantly (not by typing)
  const autofillTriggered = useRef(false);
  useEffect(() => {
    if (mode !== "signin" || loading || autofillTriggered.current) return;
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    if (!emailInput || !passwordInput) return;
    if (
      email.trim() &&
      password.trim() &&
      document.activeElement !== emailInput &&
      document.activeElement !== passwordInput
    ) {
      autofillTriggered.current = true;
      setLoading(true);
      handleEmailAuth().finally(() => {
        setTimeout(() => {
          autofillTriggered.current = false;
        }, 1000);
      });
    }
  }, [email, password, mode, loading]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    // Debug: log the current origin before redirect
    console.log("[Google OAuth] window.location.origin:", window.location.origin);
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
    if (loading) return;
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

  // Navbar title logic
  const navbarTitle = mode === "signup" ? "Sign up" : "Sign in";

  return (
    <PageTransition key={mode}>
      <div className="min-h-screen bg-background px-6 py-10 flex flex-col">
        <div className="fixed top-6 left-6 right-6 z-40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ComponentGlassBackButton />
            <h1 className="font-serif text-[22px] font-bold text-foreground">
              {navbarTitle}
            </h1>
          </div>
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
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mx-auto w-full max-w-md space-y-2 mb-6">
            {mode === "signin" || mode === "signup" ? (
              <>
                <div className="w-full">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--control-primary)]">
                      <IconMail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-[52px] w-full rounded-[40px] border border-[rgba(0,0,0,0.05)] bg-white pl-12 pr-4 text-base text-left text-foreground placeholder:text-muted-foreground/60 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 font-normal"
                    />
                  </div>

                  <div className="relative mt-2">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--control-primary)]">
                      <IconLock className="h-5 w-5" />
                    </div>
                    <input
                      type="password"
                      placeholder="Password"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-[52px] w-full rounded-[40px] border border-[rgba(0,0,0,0.05)] bg-white pl-12 pr-4 text-base text-left text-foreground placeholder:text-muted-foreground/60 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 font-normal"
                    />
                  </div>

                  <div className="w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryEmail(email);
                        setShowForgotSheet(true);
                      }}
                      className="mt-2 text-[14px] font-body font-bold text-muted-foreground bg-transparent border-none p-0 opacity-100"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>

            <div className="space-y-2 pt-1 flex flex-col w-full">
              <ButtonLarge onClick={handleEmailAuth} disabled={loading}>
                {mode === "signin" ? "Sign in" : "Sign up"}
              </ButtonLarge>
              {/* divider removed per request */}
              <ButtonLarge
                onClick={handleGoogleAuth}
                disabled={loading}
                variant="secondary"
                className="flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                  backdropFilter: "blur(40px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                <GoogleIcon />
                Continue with Google
              </ButtonLarge>
            </div>
          {/* Remove button next to forgot password, do not render anything here */}
          {/* Removed: bottom sign up instead button */}
          {/* Forgot password bottom sheet */}
          <AnimatePresence>
            {showForgotSheet && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed left-0 right-0 z-50 flex items-end justify-center bg-[var(--background-overlay)] backdrop-blur-sm"
                style={{
                  top: 'calc(0px - env(safe-area-inset-top, 0px))',
                  height: 'calc(100vh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
                  paddingTop: 'env(safe-area-inset-top, 0px)',
                  paddingBottom: 'env(safe-area-inset-bottom, 0px)'
                }}
                onClick={() => setShowForgotSheet(false)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="mb-2 w-[calc(100%-16px)] max-w-md rounded-b-[58px] rounded-t-[50px] p-6 pb-10"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                    backdropFilter: "blur(40px) saturate(1.8)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-serif text-[22px] font-bold text-foreground">Password recovery</h2>
                    <button
                      onClick={() => setShowForgotSheet(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                        backdropFilter: "blur(40px) saturate(1.8)",
                        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                        border: "1px solid rgba(255,255,255,0.5)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                      }}
                    >
                      <svg aria-hidden="true" className="h-[18px] w-[18px] text-foreground" viewBox="0 0 24 24"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                  <Input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="h-[52px] w-full rounded-[40px] border border-[rgba(0,0,0,0.05)] bg-white px-4 text-base text-center text-foreground placeholder:text-muted-foreground/60 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 font-normal"
                  />
                  <ButtonLarge
                    onClick={() => {
                      if (!recoveryEmail.trim()) {
                        appToast.error("Enter your email");
                        return;
                      }
                      setLoading(true);
                      supabase.auth.resetPasswordForEmail(recoveryEmail.trim()).then(({ error }) => {
                        setLoading(false);
                        if (error) {
                          appToast.error("No account found for this email");
                          return;
                        }
                        appToast.success("May god help you");
                        setShowForgotSheet(false);
                      });
                    }}
                    disabled={loading}
                    className="mt-6"
                  >
                    Send email
                  </ButtonLarge>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          

        </div>
      </div>
    </PageTransition>
  );
};

export default PageAuth;
