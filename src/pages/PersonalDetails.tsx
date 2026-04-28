import { useEffect, useRef, useState } from "react";
import { IconPencilFilled, IconMailFilled, IconLockFilled, IconXFilled } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassBackButton from "@/components/GlassBackButton";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import ComponentBottomSheet from "@/components/ComponentBottomSheet";
import { ListCell } from "@/components/ui/ListCell";
import { ButtonLarge } from "@/components/ui/ButtonLarge";
import { Label } from "@/components/ui/label";
import { appToast } from "@/lib/app-toast";
import { supabase } from "@/integrations/supabase/client";

const glassClose = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
  backdropFilter: "blur(40px) saturate(1.8)",
  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.5)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
};

const PagePersonalDetails = () => {
  const [name, setName] = useState("Plant lover");
  const [email, setEmail] = useState("-");
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [isDetailsResolved, setIsDetailsResolved] = useState(false);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const saveNameTimeout = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;

      const metadata = data.user?.user_metadata ?? {};
      const fullName = String(metadata.full_name ?? metadata.name ?? "").trim();
      setName(fullName || "Plant lover");
      setEmail(data.user?.email ?? "-");

      const providers = Array.isArray(data.user?.app_metadata?.providers)
        ? data.user?.app_metadata?.providers
        : [];
      const provider = String(data.user?.app_metadata?.provider ?? "").toLowerCase();
      setIsGoogleAuth(provider === "google" || providers.includes("google"));

      setIsDetailsResolved(true);
      window.requestAnimationFrame(() => {
        if (isMounted) setIsDetailsVisible(true);
      });
    });

    return () => {
      isMounted = false;
      if (saveNameTimeout.current) {
        window.clearTimeout(saveNameTimeout.current);
      }
    };
  }, []);

  const handleNameChange = (nextValue: string) => {
    setName(nextValue);

    if (saveNameTimeout.current) {
      window.clearTimeout(saveNameTimeout.current);
    }

    saveNameTimeout.current = window.setTimeout(async () => {
      const trimmed = nextValue.trim();
      await supabase.auth.updateUser({
        data: {
          full_name: trimmed || null,
        },
      });
    }, 400);
  };

  const handlePasswordChange = async () => {
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      appToast.error("Something went wrong");
      setIsUpdatingPassword(false);
      return;
    }
    appToast.success("Password now updated");
    setShowPasswordSheet(false);
    setNewPassword("");
    setConfirmPassword("");
    setIsUpdatingPassword(false);
  };

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-[720px] px-6 z-40 flex items-center gap-3">
            <GlassBackButton to="/profile" />
            <h1 className="font-serif text-[22px] font-bold text-foreground">Personal details</h1>
          </div>

          <div className="px-6 pt-20">
            <div className="space-y-1">
              {/* Name — inline editable */}
                <ListCell
                  icon={<IconPencilFilled className="h-5 w-5 shrink-0 text-primary" />}
                title="Name"
                right={{ type: "input", value: name, onChange: handleNameChange }}
                rightContainerClassName={isDetailsResolved && isDetailsVisible ? "transition-opacity duration-300 opacity-100" : "opacity-0"}
              />

              {/* Email (read-only) */}
              <ListCell
                icon={<IconMailFilled className="h-5 w-5 shrink-0 text-primary" />}
                title="Email"
                right={{ type: "text", value: email }}
                rightContainerClassName={isDetailsResolved && isDetailsVisible ? "transition-opacity duration-300 opacity-100" : "opacity-0"}
              />

              {/* Password */}
              <ListCell
                icon={<IconLockFilled className="h-5 w-5 shrink-0 text-primary" />}
                title="Password"
                right={
                  isGoogleAuth
                    ? { type: "text", value: "Managed by Google" }
                    : { type: "button-low", label: "Change", variant: "secondary", onPress: () => setShowPasswordSheet(true) }
                }
                rightContainerClassName={isDetailsResolved && isDetailsVisible ? "transition-opacity duration-300 opacity-100" : "opacity-0"}
              />
            </div>

          </div>
        </div>
      </ScrollFadeLayout>

      {/* Change password bottom sheet */}
      <AnimatePresence>
        {showPasswordSheet && (
          <ComponentBottomSheet onClose={() => setShowPasswordSheet(false)}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-[22px] font-bold text-foreground">Change password</h2>
                <button
                  onClick={() => setShowPasswordSheet(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                  style={glassClose}
                >
                    <IconXFilled className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                </button>
              </div>

              <div className="space-y-1 pb-4">
                <ListCell
                  icon={<IconLockFilled className="h-5 w-5 shrink-0 text-primary" />}
                  title="New password"
                  right={{
                    type: "input",
                    value: newPassword,
                    onChange: setNewPassword,
                    placeholder: "Minimum 6",
                    inputType: "password",
                    autoComplete: "new-password",
                    inputClassName: "w-36",
                  }}
                />

                <ListCell
                  icon={<IconLockFilled className="h-5 w-5 shrink-0 text-primary" />}
                  title="Repeat"
                  right={{
                    type: "input",
                    value: confirmPassword,
                    onChange: setConfirmPassword,
                    placeholder: "Repeat",
                    inputType: "password",
                    autoComplete: "new-password",
                    inputClassName: "w-32",
                  }}
                />
              </div>
              <ButtonLarge
                variant="primary"
                className="mt-4"
                onClick={handlePasswordChange}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? "Updating..." : "Update password"}
              </ButtonLarge>
          </ComponentBottomSheet>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default PagePersonalDetails;
