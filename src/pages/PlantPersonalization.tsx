import { MapPin, Thermometer, ChevronRight } from "lucide-react";
import GlassBackButton from "@/components/GlassBackButton";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";

const PlantPersonalization = () => {
  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
            <GlassBackButton to="/profile" />
            <h1 className="font-serif text-lg font-bold text-foreground">Personalization</h1>
          </div>

          <div className="space-y-2 px-6 pt-20">
            <button className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5 text-left transition-colors hover:bg-secondary">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">City</p>
                  <p className="text-xs text-muted-foreground">Used for climate-based care tips</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Barcelona</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>

            <div className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-5">
              <div className="flex items-center gap-3">
                <Thermometer className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Home thermometer</p>
                  <p className="text-xs text-muted-foreground">Connect a smart thermometer</p>
                </div>
              </div>
              <button className="rounded-xl bg-muted px-4 py-2 text-xs font-medium text-muted-foreground transition-all">
                Connected
              </button>
            </div>
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default PlantPersonalization;
