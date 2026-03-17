import fs from "node:fs/promises";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";

type TokenDraft = {
  token: string;
  value: string;
  opacity: number;
};

const THEME_TOKENS_FILE_PATH = path.resolve(__dirname, "src/data/themeTokens.ts");

const isTokenDraftArray = (value: unknown): value is TokenDraft[] => {
  if (!Array.isArray(value)) return false;

  return value.every((item) => {
    if (!item || typeof item !== "object") return false;

    const maybe = item as Partial<TokenDraft>;

    return (
      typeof maybe.token === "string" &&
      typeof maybe.value === "string" &&
      typeof maybe.opacity === "number"
    );
  });
};

const buildThemeTokensFileContent = (tokens: TokenDraft[]) => {
  const rows = tokens
    .map(
      (item) =>
        `  { token: ${JSON.stringify(item.token)}, value: ${JSON.stringify(item.value.toUpperCase())}, opacity: ${Math.max(0, Math.min(100, Math.round(item.opacity)))} },`,
    )
    .join("\n");

  return `import type { TokenDraft } from "@/lib/theme-tokens";

export const PROJECT_THEME_TOKENS: TokenDraft[] = [
${rows}
];
`;
};

const themeTokenSyncPlugin = (): Plugin => ({
  name: "theme-token-sync-plugin",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.method !== "POST" || req.url !== "/__sync-theme-tokens") {
        next();
        return;
      }

      try {
        const chunks: Buffer[] = [];

        for await (const chunk of req) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        const rawBody = Buffer.concat(chunks).toString("utf8");
        const parsed = JSON.parse(rawBody) as { tokens?: unknown };

        if (!isTokenDraftArray(parsed.tokens)) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Invalid tokens payload." }));
          return;
        }

        const nextFileContent = buildThemeTokensFileContent(parsed.tokens);
        await fs.writeFile(THEME_TOKENS_FILE_PATH, nextFileContent, "utf8");

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Failed to sync tokens." }));
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), themeTokenSyncPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
