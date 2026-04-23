import { useEffect, useState } from "react";
import { IconMapPinFilled, IconPlusFilled } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import GlassBackButton from "@/components/GlassBackButton";
import { ListCell } from "@/components/ui/ListCell";
import {
  ensureActiveHomeForCurrentUser,
  getActiveHomeId,
  setActiveHomeId,
} from "@/lib/homes";
import { appToast } from "@/lib/app-toast";
import { supabase } from "@/integrations/supabase/client";

type HomeRow = {
  id: string;
  name: string;
};

type MembershipRow = {
  home_id: string;
  homes: HomeRow | HomeRow[] | null;
};

const BASE_HOME_NAME = "My home";

const getNextDefaultHomeName = (homes: HomeRow[]) => {
  const existingNames = new Set(
    homes.map((home) => home.name.trim().toLowerCase()).filter((name) => name.length > 0),
  );

  if (!existingNames.has(BASE_HOME_NAME.toLowerCase())) {
    return BASE_HOME_NAME;
  }

  let suffix = 2;
  while (existingNames.has(`${BASE_HOME_NAME} ${suffix}`.toLowerCase())) {
    suffix += 1;
  }

  return `${BASE_HOME_NAME} ${suffix}`;
};

const PageHomes = () => {
  const navigate = useNavigate();
  const [homes, setHomes] = useState<HomeRow[]>([]);
  const [activeHomeId, setActiveHomeIdState] = useState<string | null>(getActiveHomeId());
  const [isLoading, setIsLoading] = useState(true);
  const [isHomesVisible, setIsHomesVisible] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const glassAction = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
    backdropFilter: "blur(40px) saturate(1.8)",
    WebkitBackdropFilter: "blur(40px) saturate(1.8)",
    border: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
  };

  const loadHomes = async () => {
    setIsLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setHomes([]);
      setActiveHomeIdState(null);
      setIsLoading(false);
      return;
    }

    let { data: membershipsData, error: membershipsError } = await supabase
      .from("home_members")
      .select("home_id,homes(id,name)")
      .eq("user_id", userId)
      .order("joined_at", { ascending: true });

    if (!membershipsData || membershipsData.length === 0) {
      const resolvedActive = await ensureActiveHomeForCurrentUser();
      if (resolvedActive) {
        setActiveHomeIdState(resolvedActive);
        const refetch = await supabase
          .from("home_members")
          .select("home_id,homes(id,name)")
          .eq("user_id", userId)
          .order("joined_at", { ascending: true });
        membershipsData = refetch.data;
        membershipsError = refetch.error;
      }
    }

    if (membershipsError) {
      setHomes([]);
      setActiveHomeIdState(null);
      setIsLoading(false);
      return;
    }

    const memberships = (membershipsData ?? []) as MembershipRow[];
    const nextHomes = memberships
      .map((item) => {
        const relation = item.homes;
        const home = Array.isArray(relation) ? relation[0] : relation;
        return home ?? null;
      })
      .filter((home): home is HomeRow => Boolean(home));

    if (nextHomes.length === 0) {
      setHomes([]);
      setActiveHomeIdState(null);
      setIsLoading(false);
      return;
    }

    setHomes(nextHomes);

    const storedActive = getActiveHomeId();
    const hasStoredActive = storedActive && nextHomes.some((home) => home.id === storedActive);
    const resolvedActive = hasStoredActive ? storedActive : nextHomes[0].id;
    setActiveHomeId(resolvedActive);
    setActiveHomeIdState(resolvedActive);

    setIsLoading(false);

    window.requestAnimationFrame(() => {
      setIsHomesVisible(true);
    });
  };

  useEffect(() => {
    loadHomes();
  }, []);

  const handleSwitchHome = (homeId: string) => {
    setActiveHomeId(homeId);
    setActiveHomeIdState(homeId);
    navigate("/plants");
  };

  const handleCreateHome = async () => {
    setIsBusy(true);

    // Ensure user is authenticated
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      appToast.error("You must be logged in to create a home");
      setIsBusy(false);
      return;
    }

    const nextName = getNextDefaultHomeName(homes);

    // Use new RPC to always create a new home
    const { data: rpcData, error: rpcError } = await supabase.rpc("create_new_home", {
      home_name: nextName,
    });
    if (rpcError || !rpcData) {
      appToast.error("Home creation failed");
      setIsBusy(false);
      return;
    }
    setActiveHomeId(rpcData);
    setActiveHomeIdState(rpcData);
    await loadHomes();
    appToast.success("New home added");
    setIsBusy(false);
  };

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-[720px] px-6 z-40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GlassBackButton to="/profile" />
              <h1 className="font-serif text-[22px] font-bold text-foreground">Homes</h1>
            </div>
            <button
              type="button"
              onClick={handleCreateHome}
              disabled={isBusy}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-60"
              style={glassAction}
            >
              <IconPlusFilled className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
            </button>
          </div>

          <div className="px-6 pt-20">
            {!isLoading && homes.length === 0 ? (
              <div className="rounded-[20px] bg-secondary px-5 py-4">
                <p className="text-sm font-medium text-foreground">No homes yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create a home with the plus button above</p>
              </div>
            ) : homes.length > 0 ? (
              <div className={`space-y-1 transition-opacity duration-300 ${isHomesVisible ? "opacity-100" : "opacity-0"}`}>
                {homes.map((home) => {
                  return (
                    <div key={home.id} className="space-y-1">
                      <ListCell
                        icon={<IconMapPinFilled className="h-6 w-6 shrink-0 text-primary" style={{height:24,width:24}} />}
                        title={home.name}
                        right={{ type: "chevron" }}
                        onPress={() => navigate(`/homes/${home.id}`, { state: { homeName: home.name } })}
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default PageHomes;
