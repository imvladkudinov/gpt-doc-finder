import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import GlassBackButton from "@/components/GlassBackButton";
import { Input } from "@/components/ui/input";
import { ButtonLarge } from "@/components/ui/ButtonLarge";
import { appToast } from "@/lib/app-toast";
import { supabase } from "@/integrations/supabase/client";

const PasswordRecovery = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRecovery = async () => {
    if (!email.trim()) {
      appToast.error("Enter your email");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) {
      appToast.error("No account found for this email");
      return;
    }
    appToast.success("Recovery email sent");
    navigate("/", { replace: true });
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <div className="mx-auto w-full max-w-md space-y-6 text-center">
          <div className="flex items-center gap-3 mb-6">
            <GlassBackButton to="/auth" />
            <h1 className="font-serif text-[26px] font-bold text-foreground">Password recovery</h1>
          </div>
          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[52px] rounded-none border-0 border-b border-icon-secondary bg-transparent px-0 text-left shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <ButtonLarge onClick={handleRecovery} disabled={loading} className="mt-6">
            Start recovery
          </ButtonLarge>
        </div>
      </div>
    </PageTransition>
  );
};

export default PasswordRecovery;
