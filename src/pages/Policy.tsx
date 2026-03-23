import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import GlassBackButton from "@/components/GlassBackButton";

const Policy = () => (
  <PageTransition>
    <ScrollFadeLayout>
      <div className="min-h-screen bg-background pb-24">
        <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
          <GlassBackButton to="/profile" />
          <h1 className="font-serif text-[22px] font-bold text-foreground">Privacy Policy</h1>
        </div>
        <div className="px-6 pt-20 space-y-4">
          <p className="text-xs text-muted-foreground">Last updated: March 2026</p>
          <p>This application allows users to sign in using Google OAuth.</p>
          <p>When you sign in with Google, the application may receive basic profile information such as your email address and name. This information is used only for authentication and to create or manage your account in the application.</p>
          <p>The application does not sell, rent, or share your personal information with third parties.</p>
          <p>The data received from Google is used solely to provide the functionality of the application.</p>
          <p>If you have questions about this Privacy Policy, you may contact the developer at:</p>
          <p className="font-mono text-sm">ikudinow@gmail.com</p>
        </div>
      </div>
    </ScrollFadeLayout>
  </PageTransition>
);

export default Policy;
