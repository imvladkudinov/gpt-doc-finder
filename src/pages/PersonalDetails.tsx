import { useState } from "react";
import { Pencil, Mail, Lock, Crown, X, Eye, EyeOff, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassBackButton from "@/components/GlassBackButton";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";

const glassClose = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
  backdropFilter: "blur(40px) saturate(1.8)",
  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.5)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
};

const PersonalDetails = () => {
  const [name, setName] = useState("Alejandra García");
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [showSubscriptionSheet, setShowSubscriptionSheet] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePasswordChange = () => {
    if (newPassword.length >= 6 && newPassword === confirmPassword) {
      setShowPasswordSheet(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
            <GlassBackButton to="/profile" />
            <h1 className="font-serif text-lg font-bold text-foreground">Personal details</h1>
          </div>

          <div className="px-6 pt-20">
            {/* General section */}
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              General
            </p>
            <div className="space-y-2">
              {/* Name — inline editable */}
              <div className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-4">
                <div className="flex items-center gap-3">
                  <Pencil className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">Name</span>
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-1/2 bg-transparent text-right text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                />
              </div>

              {/* Email (read-only) */}
              <div className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">Email</span>
                </div>
                <span className="text-sm text-muted-foreground">alejandra@plantcare.com</span>
              </div>

              {/* Password */}
              <button
                onClick={() => setShowPasswordSheet(true)}
                className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-4 text-left transition-colors active:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">Password</span>
                </div>
                <span className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">
                  Change
                </span>
              </button>
            </div>

            {/* Subscription */}
            <p className="mb-2 mt-6 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Subscription
            </p>
            <button
              onClick={() => setShowSubscriptionSheet(true)}
              className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-4 text-left transition-colors active:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 shrink-0 text-purple-500" fill="currentColor" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Premium Plan</p>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-purple-500"
                      style={{
                        background: "linear-gradient(135deg, rgba(168,130,255,0.2) 0%, rgba(168,130,255,0.08) 100%)",
                        backdropFilter: "blur(40px) saturate(1.8)",
                        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                        border: "1px solid rgba(168,130,255,0.25)",
                        boxShadow: "0 4px 16px rgba(168,130,255,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
                      }}
                    >
                      Active
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Renews on March 15, 2027</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </div>
        </div>
      </ScrollFadeLayout>

      {/* Change password bottom sheet */}
      <AnimatePresence>
        {showPasswordSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowPasswordSheet(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-card p-6 pb-10"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-foreground">Change password</h2>
                <button
                  onClick={() => setShowPasswordSheet(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
                  style={glassClose}
                >
                  <X className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                </button>
              </div>

              <div className="mb-2 flex items-center justify-between rounded-2xl bg-secondary px-5 py-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">New password</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-24 bg-transparent text-right text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                    autoFocus
                  />
                  <button onClick={() => setShowNew(!showNew)} className="text-muted-foreground">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between rounded-2xl bg-secondary px-5 py-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">Confirm</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-24 bg-transparent text-right text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} className="text-muted-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="mb-2 text-xs text-accent px-1">Passwords don't match</p>
              )}

              <button
                onClick={handlePasswordChange}
                disabled={newPassword.length < 6 || newPassword !== confirmPassword}
                className="mt-4 w-full rounded-full bg-primary py-4 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                Update password
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription bottom sheet */}
      <AnimatePresence>
        {showSubscriptionSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm"
            onClick={() => setShowSubscriptionSheet(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-card p-6 pb-10"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-foreground">Subscription</h2>
                <button
                  onClick={() => setShowSubscriptionSheet(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
                  style={glassClose}
                >
                  <X className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                </button>
              </div>

              <div className="mb-2 flex items-center justify-between rounded-2xl bg-secondary px-5 py-4">
                <span className="text-sm font-medium text-foreground">Plan</span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-purple-500"
                  style={{
                    background: "linear-gradient(135deg, rgba(168,130,255,0.2) 0%, rgba(168,130,255,0.08) 100%)",
                    backdropFilter: "blur(40px) saturate(1.8)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                    border: "1px solid rgba(168,130,255,0.25)",
                    boxShadow: "0 4px 16px rgba(168,130,255,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  Premium
                </span>
              </div>

              <div className="mb-2 flex items-center justify-between rounded-2xl bg-secondary px-5 py-4">
                <span className="text-sm font-medium text-foreground">Next billing</span>
                <span className="text-sm text-muted-foreground">March 15, 2027</span>
              </div>

              <div className="mb-2 flex items-center justify-between rounded-2xl bg-secondary px-5 py-4">
                <span className="text-sm font-medium text-foreground">Price</span>
                <span className="text-sm text-muted-foreground">€4.99 / month</span>
              </div>

              <div className="mt-4 rounded-2xl bg-purple-50 p-4">
                <p className="text-sm font-medium text-purple-500 mb-1">Premium includes</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Unlimited plants & smart reminders</li>
                  <li>• AI-powered care recommendations</li>
                  <li>• Calendar & service integrations</li>
                  <li>• Priority support</li>
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  className="w-full rounded-full py-4 text-sm font-semibold text-purple-500 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, rgba(168,130,255,0.2) 0%, rgba(168,130,255,0.08) 100%)",
                    backdropFilter: "blur(40px) saturate(1.8)",
                    WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                    border: "1px solid rgba(168,130,255,0.25)",
                    boxShadow: "0 4px 16px rgba(168,130,255,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  Upgrade to yearly
                </button>
                <button className="w-full rounded-2xl py-4 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary active:scale-[0.98]">
                  Cancel subscription
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default PersonalDetails;
