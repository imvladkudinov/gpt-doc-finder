import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import GlassBackButton from "@/components/GlassBackButton";

const Terms = () => (
  <PageTransition>
    <ScrollFadeLayout>
      <div className="min-h-screen bg-background pb-24">
        <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
          <GlassBackButton to="/profile" />
          <h1 className="font-serif text-[22px] font-bold text-foreground">Terms of Service</h1>
        </div>
        <div className="px-6 pt-20 space-y-4">
          <p className="text-xs text-muted-foreground">Last updated: March 2026</p>
          <p>This application is provided as-is for personal use.</p>
          <p>The developer makes no guarantees regarding availability, reliability, or accuracy of the service.</p>
          <p>The developer may modify or discontinue the service at any time without notice.</p>
          <p>By using this application, you agree that the developer is not responsible for any damages or data loss resulting from the use of the service.</p>
          <p>For questions, contact:</p>
          <p className="font-mono text-sm">ikudinow@gmail.com</p>
        </div>
      </div>
    </ScrollFadeLayout>
  </PageTransition>
);

export default Terms;
