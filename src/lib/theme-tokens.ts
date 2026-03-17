export type TokenDraft = {
  token: string;
  value: string;
  opacity: number;
};

export const normalizeHex = (raw: string) => {
  const value = raw.trim();
  if (!value) return "";
  const withHash = value.startsWith("#") ? value : `#${value}`;
  const valid = /^#([A-Fa-f0-9]{6})$/.test(withHash);
  return valid ? withHash.toUpperCase() : "";
};

export const toHexWithOpacity = (hex: string, opacity: number) => {
  const validHex = normalizeHex(hex);
  if (!validHex) return "";

  const alpha = Math.round((Math.max(0, Math.min(100, opacity)) / 100) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();

  return `${validHex}${alpha}`;
};

export const applyTokensToRoot = (tokens: TokenDraft[]) => {
  const root = document.documentElement;

  tokens.forEach((item) => {
    const cssValue = toHexWithOpacity(item.value, item.opacity);
    if (cssValue) {
      root.style.setProperty(item.token, cssValue);
    }
  });
};
