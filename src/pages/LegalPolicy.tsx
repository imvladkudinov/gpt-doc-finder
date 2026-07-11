import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import GlassBackButton from "@/components/GlassBackButton";
import { IconCopy } from "@tabler/icons-react";
import { ButtonLow } from "@/components/ui/ButtonLow";
import { appToast } from "@/lib/app-toast";

const EMAIL = "ikudinow@gmail.com";

const LegalPolicy = () => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(EMAIL);
    appToast.success("Email copied");
  };

  const handleBack = () => window.history.back();
  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-[720px] px-6 z-40 flex items-center gap-3">
            <GlassBackButton onPress={handleBack} />
            <h1 className="font-serif text-[22px] font-bold leading-none text-foreground">Privacy policy</h1>
          </div>
          <div className="px-6 pt-20 space-y-4">
            <p className="text-[12px] font-mono uppercase tracking-wider text-muted-foreground">LAST UPDATED: MARCH 2026</p>
            <p>This application allows users to sign in using Google OAuth.</p>
            <p>When you sign in with Google, the application may receive basic profile information such as your email address and name. This information is used only for authentication and to create or manage your account in the application.</p>
            <p>The application does not sell, rent, or share your personal information with third parties.</p>
            <p>The data received from Google is used solely to provide the functionality of the application.</p>
            <p>For questions, contact:</p>
            <ButtonLow variant="secondary" className="inline-flex items-center gap-2" onClick={handleCopy}>
              <IconCopy className="w-4 h-4 shrink-0 text-primary" />
              <span>{EMAIL}</span>
            </ButtonLow>
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default LegalPolicy;
