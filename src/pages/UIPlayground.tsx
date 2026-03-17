import { useState } from "react";
import { Square } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import ScrollFadeLayout from "@/components/ScrollFadeLayout";
import { ListCell } from "@/components/ui/ListCell";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ButtonLow } from "@/components/ui/ButtonLow";
import { ButtonLarge } from "@/components/ui/ButtonLarge";
import { Tab } from "@/components/ui/Tab";
import ComponentToastPlayground from "@/components/ComponentToastPlayground";
import { PROJECT_THEME_TOKENS } from "@/data/themeTokens";
import { applyTokensToRoot, toHexWithOpacity, type TokenDraft } from "@/lib/theme-tokens";

const cloneTokens = (tokens: TokenDraft[]) => tokens.map((item) => ({ ...item }));

const PageUIPlayground = () => {
  const [activeSection, setActiveSection] = useState("colours");
  const [toggleOn, setToggleOn] = useState(false);
  const [listCellInput, setListCellInput] = useState("");
  const [listCellSwitch, setListCellSwitch] = useState(false);
  const [savedTokens, setSavedTokens] = useState<TokenDraft[]>(() => cloneTokens(PROJECT_THEME_TOKENS));
  const [draftTokens, setDraftTokens] = useState<TokenDraft[]>(() => cloneTokens(PROJECT_THEME_TOKENS));
  const [saveError, setSaveError] = useState<string | null>(null);

  const sections = [
    { id: "colours", label: "Colours" },
    { id: "label", label: "Label" },
    { id: "tab", label: "Tab" },
    { id: "list-cell", label: "List cell" },
    { id: "low-button", label: "Button Low" },
    { id: "large-button", label: "Button Large" },
    { id: "switch", label: "Switch" },
    { id: "toast", label: "Toast" },
  ];

  const tokenGroups = [
    {
      title: "Background",
      rows: draftTokens.filter((row) => row.token.startsWith("--background-")),
    },
    {
      title: "Control",
      rows: draftTokens.filter((row) => row.token.startsWith("--control-")),
    },
    {
      title: "Text",
      rows: draftTokens.filter((row) => row.token.startsWith("--text-")),
    },
    {
      title: "Icon",
      rows: draftTokens.filter((row) => row.token.startsWith("--icon-")),
    },
  ];

  const isDirty = draftTokens.some((draft) => {
    const saved = savedTokens.find((item) => item.token === draft.token);
    if (!saved) return true;
    return saved.value !== draft.value || saved.opacity !== draft.opacity;
  });

  const updateTokenValue = (token: string, value: string) => {
    setDraftTokens((prev) =>
      prev.map((item) => (item.token === token ? { ...item, value } : item)),
    );
  };

  const updateTokenOpacity = (token: string, nextValue: string) => {
    const parsed = Number(nextValue);
    const safeOpacity = Number.isNaN(parsed) ? 100 : Math.max(0, Math.min(100, Math.round(parsed)));
    setDraftTokens((prev) =>
      prev.map((item) => (item.token === token ? { ...item, opacity: safeOpacity } : item)),
    );
  };

  const applyDraftTokens = async () => {
    setSaveError(null);
    applyTokensToRoot(draftTokens);

    const response = await fetch("/__sync-theme-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens: draftTokens }),
    });

    if (!response.ok) {
      throw new Error("Failed to sync tokens into source.");
    }

    setSavedTokens(cloneTokens(draftTokens));
  };

  const handleSave = async () => {
    try {
      await applyDraftTokens();
    } catch {
      setSaveError("Saved preview, but source sync failed. Keep dev server running and try again.");
    }
  };

  return (
    <PageTransition>
      <ScrollFadeLayout>
        <div className="min-h-screen bg-background pb-24">
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-serif text-2xl font-bold text-foreground">UI Playground</h1>
              {isDirty ? <ButtonLow onClick={handleSave}>Save</ButtonLow> : null}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">A sandbox for shared UI pieces.</p>
            {saveError ? <p className="mt-2 text-xs text-destructive">{saveError}</p> : null}
          </div>

          <div className="mt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-1 px-6">
              {sections.map((section) => (
                <Tab
                  key={section.id}
                  selected={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                </Tab>
              ))}
            </div>
          </div>

          <div className="px-6">

            {activeSection === "colours" ? (
              <section className="mt-8 space-y-5">
                {tokenGroups.map((group) => (
                  <div key={group.title} className="space-y-2">
                    <h2 className="text-base font-semibold text-foreground">{group.title}</h2>
                    <div className="rounded-xl bg-secondary p-3">
                      <table className="w-full table-fixed text-left text-xs">
                        <colgroup>
                          <col />
                          <col className="w-[110px]" />
                          <col className="w-20" />
                        </colgroup>
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="pb-2 text-left">Token</th>
                            <th className="pb-2 text-left">Value</th>
                            <th className="pb-2 text-left">Opacity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.rows.map((row) => (
                            <tr key={row.token} className="border-t border-border/30">
                              <td className="py-2 pr-4 text-left text-foreground">{row.token}</td>
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-5 w-5 shrink-0 rounded border border-border"
                                    style={{ backgroundColor: toHexWithOpacity(row.value, row.opacity) || "transparent" }}
                                  />
                                  <input
                                    type="text"
                                    value={row.value}
                                    onChange={(e) => updateTokenValue(row.token, e.target.value)}
                                    className="w-28 bg-transparent p-0 text-left text-xs text-foreground focus:outline-none"
                                    placeholder="#RRGGBB"
                                  />
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="flex items-center">
                                  <input
                                    type="text"
                                    value={row.opacity}
                                    onChange={(e) => updateTokenOpacity(row.token, e.target.value)}
                                    className="w-12 bg-transparent p-0 text-left text-xs text-foreground focus:outline-none"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            {activeSection === "label" ? (
              <section className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Examples</h2>
                <div className="flex flex-wrap gap-2">
                  <Label>Default label</Label>
                  <Label disabled>Disabled label</Label>
                </div>
                <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                  Tokens used: --control-secondary, --text-secondary-control.
                </div>
              </section>
            ) : null}

            {activeSection === "tab" ? (
              <section className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Examples</h2>
                <div className="overflow-x-auto">
                  <div className="flex w-max gap-1">
                    <Tab selected>Selected</Tab>
                    <Tab>Default</Tab>
                  </div>
                </div>
                <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                  Tokens used: --control-primary, --control-secondary, --text-primary-control, --text-secondary-control.
                </div>
              </section>
            ) : null}

            {activeSection === "list-cell" ? (
              <section className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Examples</h2>
                <div className="space-y-1">
                  <ListCell icon={<Square className="h-5 w-5 text-primary" />} title="Chevron" right={{ type: "chevron" }} />
                  <ListCell icon={<Square className="h-5 w-5 text-primary" />} title="Text" right={{ type: "text", value: "Value" }} />
                  <ListCell icon={<Square className="h-5 w-5 text-primary" />} title="Chevron + text" right={{ type: "chevron-text", value: "Value" }} />
                  <ListCell icon={<Square className="h-5 w-5 text-primary" />} title="Input" right={{ type: "input", value: listCellInput, onChange: setListCellInput, placeholder: "Type…" }} />
                  <ListCell icon={<Square className="h-5 w-5 text-primary" />} title="Label" right={{ type: "label", label: "Action" }} />
                  <ListCell icon={<Square className="h-5 w-5 text-primary" />} title="Button low" right={{ type: "button-low", label: "Save" }} />
                  <ListCell icon={<Square className="h-5 w-5 text-primary" />} title="Disabled text" right={{ type: "disabled-text", value: "Unavailable" }} />
                  <ListCell icon={<Square className="h-5 w-5 text-primary" />} title="Switch" right={{ type: "switch", checked: listCellSwitch, onCheckedChange: setListCellSwitch }} />
                  <ListCell icon={<Square className="h-5 w-5 text-primary" />} title="With subtitle" subtitle="Sample subtitle text" right={{ type: "chevron" }} />
                  <ListCell title="No icon" right={{ type: "text", value: "No icon" }} />
                  <ListCell title="No right slot" />
                </div>
                <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                  Tokens used: --background-secondary, --text-main, --text-secondary, --icon-primary.
                </div>
              </section>
            ) : null}

            {activeSection === "low-button" ? (
              <section className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Examples</h2>
                <div className="flex flex-wrap gap-3">
                  <ButtonLow>Primary</ButtonLow>
                  <ButtonLow variant="secondary">Secondary</ButtonLow>
                  <ButtonLow disabled>Disabled primary</ButtonLow>
                  <ButtonLow variant="secondary" disabled>Disabled secondary</ButtonLow>
                </div>
                <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                  Tokens used: --control-primary, --control-secondary, --text-primary-control, --text-secondary-control.
                </div>
              </section>
            ) : null}

            {activeSection === "large-button" ? (
              <section className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Examples</h2>
                <div className="space-y-3">
                  <ButtonLarge>Primary</ButtonLarge>
                  <ButtonLarge variant="secondary">Secondary</ButtonLarge>
                  <ButtonLarge disabled>Disabled primary</ButtonLarge>
                  <ButtonLarge variant="secondary" disabled>Disabled secondary</ButtonLarge>
                </div>
                <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                  Tokens used: --control-primary, --control-secondary, --text-primary-control, --text-secondary-control.
                </div>
              </section>
            ) : null}

            {activeSection === "switch" ? (
              <section className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Examples</h2>
                <div className="flex items-center gap-3">
                  <Switch checked={toggleOn} onCheckedChange={setToggleOn} />
                </div>
                <div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
                  Tokens used: --control-primary, --background-secondary, --text-secondary.
                </div>
              </section>
            ) : null}

            {activeSection === "toast" ? <ComponentToastPlayground /> : null}
          </div>
        </div>
      </ScrollFadeLayout>
    </PageTransition>
  );
};

export default PageUIPlayground;
