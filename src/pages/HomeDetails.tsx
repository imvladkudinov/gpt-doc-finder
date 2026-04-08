import { IconHomeFilled, IconMailFilled, IconPlusFilled, IconUserFilled, IconXFilled } from "@tabler/icons-react";
import { IconMapPinFilled } from "@tabler/icons-react";
import { IconMoodNeutralFilled } from "@tabler/icons-react";
import { IconKeyframesFilled } from "@tabler/icons-react";
import { Share } from "lucide-react";
import avatarPlant from "@/assets/avatar-plant.png";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import GlassBackButton from "@/components/GlassBackButton";
import { ListCell } from "@/components/ui/ListCell";
import { ButtonLow } from "@/components/ui/ButtonLow";
import { ButtonLarge } from "@/components/ui/ButtonLarge";
import { appToast } from "@/lib/app-toast";
import { sendHomeInvite } from "@/lib/home-invites";
import {
  deleteHomeAndEnsureFallback,
  leaveHomeAndEnsureFallback,
} from "@/lib/homes";
import { supabase } from "@/integrations/supabase/client";

type HomeRow = {
  id: string;
  name: string;
};

type MemberRow = {
  user_id: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ConfirmAction = "leave" | "delete" | null;

const glassAction = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
  backdropFilter: "blur(40px) saturate(1.8)",
  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
  border: "1px solid rgba(255,255,255,0.5)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
};

const PageHomeDetails = () => {
  const { homeId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialHomeName = (location.state as any)?.homeName ?? "Home";

  const [home, setHome] = useState<HomeRow | null>(null);
  const [homeName, setHomeName] = useState(initialHomeName);
  const [isHomeTitleVisible, setIsHomeTitleVisible] = useState(false);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, ProfileRow>>({});
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [isMembersVisible, setIsMembersVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState("Plant lover");
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const saveHomeNameTimeout = useRef<number | null>(null);

  const loadData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    setCurrentUserId(user.id);
    const metadata = user.user_metadata ?? {};
    const fullName = String(metadata.full_name ?? metadata.name ?? "").trim();
    const avatar = String(metadata.avatar_url ?? metadata.picture ?? "").trim();
    setCurrentUserName(fullName || "Plant lover");
    setCurrentUserAvatar(avatar || null);

    const { data: homeData } = await supabase
      .from("homes")
      .select("id,name")
      .eq("id", homeId)
      .single();

    if (homeData) {
      const typedHome = homeData as HomeRow;
      setHome(typedHome);
      setHomeName(typedHome.name);
      window.requestAnimationFrame(() => {
        setIsHomeTitleVisible(true);
      });
    }

    setIsMembersLoading(true);

    const membersResult = await supabase
      .from("home_members")
      .select("user_id")
      .eq("home_id", homeId)
      .order("joined_at", { ascending: true });

    const typedMembers = (membersResult.data ?? []) as MemberRow[];
    setMembers(typedMembers);

    const memberIds = typedMembers.map((member) => member.user_id);

    if (memberIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url")
        .in("id", memberIds);

      const profileMap: Record<string, ProfileRow> = {};
      ((profilesData ?? []) as ProfileRow[]).forEach((profile) => {
        profileMap[profile.id] = profile;
      });

      setMemberProfiles(profileMap);
    } else {
      setMemberProfiles({});
    }

    setIsMembersLoading(false);

    window.requestAnimationFrame(() => {
      setIsMembersVisible(true);
    });
  };

  useEffect(() => {
    loadData();

    return () => {
      if (saveHomeNameTimeout.current) {
        window.clearTimeout(saveHomeNameTimeout.current);
      }
    };
  }, [homeId]);

  const handleHomeNameChange = (next: string) => {
    setHomeName(next);

    if (saveHomeNameTimeout.current) {
      window.clearTimeout(saveHomeNameTimeout.current);
    }

    saveHomeNameTimeout.current = window.setTimeout(async () => {
      const trimmed = next.trim();
      if (!trimmed) return;

      await supabase.from("homes").update({ name: trimmed }).eq("id", homeId);
      setHome((prev) => (prev ? { ...prev, name: trimmed } : prev));
    }, 350);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    setIsBusy(true);

    if (confirmAction === "leave") {
      const nextHome = await leaveHomeAndEnsureFallback(homeId);
      if (nextHome) {
        appToast.success("You left home");
        navigate("/plants");
      } else {
        appToast.error("Leave home failed");
      }
    }

    if (confirmAction === "delete") {
      const nextHome = await deleteHomeAndEnsureFallback(homeId);
      if (nextHome) {
        appToast.success("Home was deleted");
        navigate("/plants");
      } else {
        appToast.error("Something went wrong");
      }
    }

    setIsBusy(false);
    setConfirmAction(null);
  };

  const handleShareInvite = async () => {
    const result = await sendHomeInvite(homeId, inviteEmail);
    const rawToastMessage = result.message || (result.ok ? "Invite sent" : "Something went wrong");
    const toastMessage = rawToastMessage.replace(/[.\s]+$/, "");

    if (result.ok) {
      appToast.success(toastMessage, {
        duration: 3200,
      });
    } else {
      appToast.error(toastMessage, {
        duration: 3200,
      });
    }

    if (result.ok) {
      setInviteEmail("");
      setTimeout(() => {
        setShowShareSheet(false);
      }, 700);
    }
  };

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-28">
          <div className="fixed top-6 left-6 right-6 z-40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GlassBackButton to="/homes" />
              {isHomeTitleVisible && (
                <h1 className="font-serif text-[22px] font-bold text-foreground transition-opacity duration-300 opacity-100">
                  {homeName}
                </h1>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowShareSheet(true);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
              style={glassAction}
            >
              <Share className="h-[20px] w-[20px] text-foreground" strokeWidth={2.2} />
            </button>
          </div>

          <div className="px-6 pt-20">
            <div className="space-y-1">
              <ListCell
                icon={<IconMapPinFilled className="h-6 w-6 shrink-0 text-primary" />}
                title="Home name"
                right={{ type: "input", value: homeName, onChange: handleHomeNameChange }}
              />
            </div>

            {!isMembersLoading && (
              <>
                <p className="mb-2 mt-6 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Members</p>

                <div className={`space-y-1 transition-opacity duration-300 ${isMembersVisible ? "opacity-100" : "opacity-0"}`}>
              {members.map((member, index) => {
                const isCurrentUser = member.user_id === currentUserId;
                const profile = memberProfiles[member.user_id];

                const displayName =
                  profile?.full_name?.trim() || (isCurrentUser ? currentUserName : "Plant lover");

                const displayAvatar = profile?.avatar_url || (isCurrentUser ? currentUserAvatar : null);

                return (
                  <ListCell
                    key={`${member.user_id}-${index}`}
                    icon={
                      displayAvatar ? (
                        <img
                          src={displayAvatar}
                          alt="Member avatar"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <img
                          src={avatarPlant}
                          alt="Member avatar"
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      )
                  }
                    title={displayName}
                  />
                );
              })}

              {members.length === 1 ? (
                <ListCell
                  icon={<IconMoodNeutralFilled className="h-4 w-4 shrink-0 text-primary" />}
                  title="You are on your own"
                  right={{ type: "button-low", label: "Share", variant: "primary", onPress: () => {
                    setShowShareSheet(true);
                  } }}
                />
              ) : null}
            </div>
              </>
            )}

            {!isMembersLoading && (
              <div className={`mt-4 flex items-center justify-start gap-2 transition-opacity duration-300 ${isMembersVisible ? "opacity-100" : "opacity-0"}`}>
              {members.length > 1 ? (
                <ButtonLow
                  onClick={() => setConfirmAction("leave")}
                  variant="error"
                >
                  Leave
                </ButtonLow>
              ) : null}
              <ButtonLow
                onClick={() => setConfirmAction("delete")}
                variant="error"
              >
                Delete
              </ButtonLow>
            </div>
            )}
          </div>
        </div>
      </ScrollFadeLayout>

      <AnimatePresence>
        {showShareSheet ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed left-0 right-0 z-50 flex items-end justify-center bg-[var(--background-overlay)] backdrop-blur-sm"
              style={{
                top: 'calc(0px - env(safe-area-inset-top, 0px))',
                height: 'calc(100vh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
              }}
              onClick={() => setShowShareSheet(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="mb-2 w-[calc(100%-16px)] rounded-b-[58px] rounded-t-[50px] p-6 pb-10 overflow-y-auto"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                  backdropFilter: "blur(40px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
                  maxHeight: 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 16px)',
                }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-serif text-[22px] font-bold text-foreground">Share home</h2>
                  <button
                    onClick={() => setShowShareSheet(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95"
                    style={glassAction}
                  >
                    <IconXFilled className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="space-y-1">
                  <ListCell
                    icon={<IconMailFilled className="h-5 w-5 shrink-0 text-primary" />}
                    title="Email"
                    right={{
                      type: "input",
                      value: inviteEmail,
                      onChange: setInviteEmail,
                      placeholder: "name@example.com",
                      inputClassName: "w-44",
                    }}
                  />
                </div>

                <p className="mt-2 w-full text-xs leading-relaxed text-muted-foreground">
                  Enter the email of the person you want to add to this home. If they already have an account, they
                  are added immediately and can start managing plants together.
                </p>

                <div className="mt-4">
                  <ButtonLarge
                    variant="primary"
                    onClick={handleShareInvite}
                  >
                    Add member
                  </ButtonLarge>
                </div>
              </motion.div>
            </motion.div>
          </>
        ) : null}

        {confirmAction ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 z-50 bg-[var(--background-overlay)]"
              style={{
                top: 'calc(0px - env(safe-area-inset-top, 0px))',
                height: 'calc(100vh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
              }}
              onClick={() => setConfirmAction(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="fixed inset-0 z-50 m-auto flex h-fit w-[85%] max-w-xs flex-col rounded-b-[54px] rounded-t-[46px] p-7"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.28) 100%)",
                backdropFilter: "blur(40px) saturate(1.8)",
                WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                border: "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              <h2 className="font-serif text-[22px] font-semibold text-foreground">
                {confirmAction === "leave"
                  ? "Leave this home?"
                  : "Delete this home?"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {confirmAction === "leave"
                  ? "You will leave this home. If it is your last one, a new home will be created automatically."
                  : "This will permanently delete the home and all plants inside it."}
              </p>
              <div className="mt-5 flex items-center justify-start gap-2">
                <ButtonLow
                  variant="secondary"
                  onClick={() => setConfirmAction(null)}
                  disabled={isBusy}
                >
                  Cancel
                </ButtonLow>
                <ButtonLow
                  variant="error"
                  onClick={handleConfirmAction}
                  disabled={isBusy}
                >
                  Confirm
                </ButtonLow>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </PageTransition>
  );
};

export default PageHomeDetails;
