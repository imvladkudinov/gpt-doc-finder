import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import GlassBackButton from "@/components/GlassBackButton";
import { ListCell } from "@/components/ui/ListCell";
import { IconFileSmileFilled } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const Legal = () => {
  const navigate = useNavigate();
  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-6 right-6 z-40 flex items-center gap-3">
            <GlassBackButton to="/profile" />
            <h1 className="font-serif text-[20px] font-bold text-foreground">Legal stuff</h1>
          </div>
          <div className="px-6 pt-20 space-y-1">
            <ListCell
              icon={<IconFileSmileFilled className="h-5 w-5 shrink-0 text-primary" />}
              title="Terms of service"
              right={{ type: "chevron" }}
              onPress={() => navigate("/legal/terms")}
            />
            <ListCell
              icon={<IconFileSmileFilled className="h-5 w-5 shrink-0 text-primary" />}
              title="Privacy policy"
              right={{ type: "chevron" }}
              onPress={() => navigate("/legal/policy")}
            />
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default Legal;
