import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import GlassBackButton from "@/components/GlassBackButton";
import { IconCopy } from "@tabler/icons-react";
import { ButtonLow } from "@/components/ui/ButtonLow";
import { appToast } from "@/lib/app-toast";

const EMAIL = "ikudinow@gmail.com";

const LegalTerms = () => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(EMAIL);
    appToast.success("Email copied");
  };

  const handleBack = () => window.history.back();
  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
            <GlassBackButton onPress={handleBack} />
            <h1 className="font-serif text-[22px] font-bold text-foreground">Terms of service</h1>
          </div>
          <div className="px-6 pt-20 space-y-4">
            <p className="text-[12px] font-mono uppercase tracking-wider text-muted-foreground">LAST UPDATED: MARCH 2026</p>
            <p>This application is provided as-is for personal use.</p>
            <p>The developer makes no guarantees regarding availability, reliability, or accuracy of the service.</p>
            <p>The developer may modify or discontinue the service at any time without notice.</p>
            <p>By using this application, you agree that the developer is not responsible for any damages or data loss resulting from the use of the service.</p>
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

export default LegalTerms;
