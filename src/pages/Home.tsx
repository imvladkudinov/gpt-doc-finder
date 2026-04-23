import React, { useEffect, useRef, useState } from "react";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ButtonLarge } from "@/components/ui/ButtonLarge";
import { ButtonLow } from "@/components/ui/ButtonLow";
import { appToast } from "@/lib/app-toast";
import { AnimatePresence, motion } from "framer-motion";
import { prefetchRoute } from "@/lib/route-prefetch";
import ComponentBottomSheet from "@/components/ComponentBottomSheet";

// Side icons slide out from behind the main icon
const leftIconAnim = {
  hidden: { x: 0, y: 20, rotate: 0, opacity: 1 },
  visible: {
    x: -81,
    y: 18,
    rotate: -15,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      mass: 1.2,
      delay: 0.65,
    },
  },
};

const rightIconAnim = {
  hidden: { x: 0, y: 20, rotate: 0, opacity: 1 },
  visible: {
    x: 85,
    y: 22,
    rotate: 15,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      mass: 1.2,
      delay: 0.65,
    },
  },
};

const mainIconAnim = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.0375, 1],
    transition: {
      delay: 0.65,
      duration: 1.0,
      ease: "easeInOut",
      times: [0, 0.4, 1],
    },
  },
};

const sideIconStyle: React.CSSProperties = {
  width: 120,
  height: 120,
  borderRadius: 36,
  border: "4px solid #ffffff",
  overflow: "hidden",
  position: "absolute",
  top: 0,
  left: "50%",
  marginLeft: -60,
};

const HomeIcon = () => (
  <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
    {/* Left side icon — z-index below main */}
    <motion.div
      variants={leftIconAnim}
      initial="hidden"
      animate="visible"
      style={{ ...sideIconStyle, boxShadow: "-2px 6px 6px rgba(0,0,0,0.10)", zIndex: 1, transformOrigin: "bottom center" }}
    >
      <img src="/icon plant left.png" alt="" className="w-full h-full object-cover" />
    </motion.div>

    {/* Right side icon — z-index below main */}
    <motion.div
      variants={rightIconAnim}
      initial="hidden"
      animate="visible"
      style={{ ...sideIconStyle, width: 116, height: 116, marginLeft: -58, boxShadow: "2px 6px 6px rgba(0,0,0,0.10)", zIndex: 1, transformOrigin: "bottom center" }}
    >
      <img src="/icon plant right.png" alt="" className="w-full h-full object-cover" />
    </motion.div>

    {/* Main icon on top — briefly scales up then returns */}
    <motion.div
      variants={mainIconAnim}
      initial="hidden"
      animate="visible"
      style={{ position: "relative", width: 160, height: 160, zIndex: 10, transformOrigin: "center bottom" }}
    >
      <div style={{ width: 160, height: 160, borderRadius: 44, overflow: "hidden" }}>
        <img src="/home-icon.png" alt="Planty icon" className="w-[160px] h-[160px]" style={{ filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.1))" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 44, border: "1px solid rgba(41,63,9,0.10)", pointerEvents: "none" }} />
      </div>
    </motion.div>
  </div>
);

const GoogleIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M21.805 10.023H12v3.955h5.607c-.241 1.272-.965 2.35-2.057 3.071v2.55h3.327c1.947-1.792 3.068-4.432 3.068-7.576 0-.669-.06-1.311-.14-2Z" fill="#4285F4" />
    <path d="M12 22c2.78 0 5.112-.92 6.816-2.488l-3.327-2.55c-.924.62-2.105.987-3.489.987-2.68 0-4.95-1.81-5.762-4.244H2.798v2.63A9.997 9.997 0 0 0 12 22Z" fill="#34A853" />
    <path d="M6.238 13.705A5.996 5.996 0 0 1 5.916 12c0-.592.102-1.166.283-1.705V7.665H2.798A9.997 9.997 0 0 0 2 12c0 1.61.386 3.13 1.07 4.335l3.168-2.63Z" fill="#FBBC05" />
    <path d="M12 6.05c1.512 0 2.87.52 3.94 1.542l2.956-2.956C17.108 2.97 14.776 2 12 2a9.997 9.997 0 0 0-9.202 5.665l3.401 2.63C7.05 7.86 9.32 6.05 12 6.05Z" fill="#EA4335" />
  </svg>
);

const PageHome = () => {

  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotSheet, setShowForgotSheet] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data.user) {
        navigate("/plants", { replace: true });
      }
    });
  }, [navigate]);

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

      prefetchRoute("/plants");
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
    <PageTransition duration={1.5} ease={[0.4, 0, 0.2, 1]}>
      <div className="min-h-screen bg-background px-6 py-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ scale: showForm ? 0.75 : 1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <HomeIcon />
            </motion.div>
            <motion.h1
              animate={{ marginTop: showForm ? 0 : 16 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-[30px] font-title font-bold text-foreground"
              style={{ maxWidth: 360 }}
            >
              Planty
            </motion.h1>
            <p className="mt-0.5 text-[16px] text-muted-foreground text-center" style={{ maxWidth: 360 }}>Never forget when to water your little ones. Treat your plant the way they deserve</p>
          </div>

            {/* Continue button — fades and collapses away */}
            <motion.div
              initial={false}
              animate={{ opacity: showForm ? 0 : 1, height: showForm ? 0 : "auto" }}
              transition={{ opacity: { duration: 0.2, ease: "easeInOut" }, height: { duration: 0.35, ease: "easeInOut" } }}
              style={{ overflow: "hidden" }}
              className="mt-5 flex justify-center"
            >
              <ButtonLow variant="primary" onClick={() => setShowForm(true)}>
                Continue
              </ButtonLow>
            </motion.div>

            {/* Form — expands and fades in */}
            <motion.div
              initial={false}
              animate={{ opacity: showForm ? 1 : 0, height: showForm ? "auto" : 0 }}
              transition={{ opacity: { duration: 0.3, delay: showForm ? 0.15 : 0, ease: "easeInOut" }, height: { duration: 0.4, ease: "easeInOut" } }}
              style={{ overflow: "hidden" }}
              onAnimationComplete={() => {
                if (showForm) {
                  const el = document.getElementById("home-form-wrapper");
                  if (el) el.style.overflow = "visible";
                }
              }}
              id="home-form-wrapper"
            >
                  <div className="mt-3">
                    <div className="w-full">
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="Email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-[52px] w-full rounded-[16px] px-5 text-base text-left text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 font-semibold bg-transparent"
                          style={{ border: "2px solid rgba(46,62,19,0.08)" }}
                        />
                      </div>

                      <div className="relative mt-2">
                        <input
                          type="password"
                          placeholder="Password"
                          autoComplete={mode === "signin" ? "current-password" : "new-password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-[52px] w-full rounded-[16px] px-5 text-base text-left text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 font-semibold bg-transparent"
                          style={{ border: "2px solid rgba(46,62,19,0.08)" }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-5 flex flex-col w-full">
                      <ButtonLarge onClick={handleEmailAuth} disabled={loading}>
                        {mode === "signin" ? "Sign in" : "Sign up"}
                      </ButtonLarge>

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
                        Google
                      </ButtonLarge>


                    </div>
                  </div>
                </motion.div>

          <AnimatePresence>
            {showForgotSheet && (
              <ComponentBottomSheet
                onClose={() => setShowForgotSheet(false)}
                sheetClassName="max-w-md"
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
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--control-primary)]">
                      <IconMail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="h-[52px] w-full rounded-[40px] border border-[rgba(0,0,0,0.05)] bg-white pl-12 pr-4 text-base text-left text-foreground placeholder:text-muted-foreground/60 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 font-normal"
                    />
                  </div>
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
              </ComponentBottomSheet>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="fixed left-0 right-0 bottom-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex flex-row justify-center gap-8">
          {!showForm ? (
            <>
              <button
                className="text-[14px] font-body font-bold text-muted-foreground bg-transparent border-none p-0"
                onClick={() => navigate("/legal/terms")}
                onMouseEnter={() => prefetchRoute("/legal/terms")}
                onFocus={() => prefetchRoute("/legal/terms")}
                onTouchStart={() => prefetchRoute("/legal/terms")}
              >
                Terms
              </button>
              <button
                className="text-[14px] font-body font-bold text-muted-foreground bg-transparent border-none p-0"
                onClick={() => navigate("/legal/policy")}
                onMouseEnter={() => prefetchRoute("/legal/policy")}
                onFocus={() => prefetchRoute("/legal/policy")}
                onTouchStart={() => prefetchRoute("/legal/policy")}
              >
                Policy
              </button>
            </>
          ) : (
            <>
              <button
                className="text-[14px] font-body font-bold text-muted-foreground bg-transparent border-none p-0"
                onClick={() => {
                  setRecoveryEmail(email);
                  setShowForgotSheet(true);
                }}
              >
                Forgot password?
              </button>
              <button
                className="text-[14px] font-body font-bold text-muted-foreground bg-transparent border-none p-0"
                onClick={() => setMode((prev) => (prev === "signin" ? "signup" : "signin"))}
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default PageHome;
