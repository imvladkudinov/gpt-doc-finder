# Planty – Plant Care PWA

A progressive web app for managing plant care reminders across shared homes. Built with React, TypeScript, Vite, Supabase, and deployed on Vercel.

## Project Setup

### Local Development

**Requirements:**
- Node.js 18+ (use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage versions)
- **npm only** — this project uses npm exclusively. Do not use bun, yarn, or pnpm, as they will cause lockfile drift with `package-lock.json`.

**Installation:**

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm i
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Environment Variables

Copy `.env.example` to `.env` and fill in:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase anonymous key
- `VITE_VAPID_PUBLIC_KEY` — public key from your web-push VAPID keypair (for push notifications)

Get these from your Supabase project dashboard and web-push VAPID setup.

## Architecture

### Core Stack

- **Frontend:** React 18 + TypeScript + Vite (fast HMR, optimal bundling)
- **Styling:** Tailwind CSS + shadcn/ui components + custom theme token system
- **Backend:** Supabase (PostgreSQL with RLS policies for multi-home sharing)
- **Edge Functions:** Deno-based serverless for scheduled reminders and notification dispatch
- **Deployment:** Vercel (SPA rewrite, security headers, immutable asset caching)
- **PWA:** Service worker for offline support, push notifications via Web Push API

### Key Features

#### Optimistic UI Updates
Plant watering actions update the UI immediately while syncing in the background. If the request fails, the UI rolls back to the previous state without interrupting other concurrent changes. See `src/pages/Plants.tsx` for the implementation pattern.

#### Multi-Home Shared Access
Uses Supabase RLS (Row-Level Security) policies so users can manage plants across multiple homes with fine-grained access control. Each home is a shared resource with explicit member management.

#### Push Notifications
- Scheduled reminders for watering and replanting delivered in user's preferred time slot (Morning/Day/Evening CET)
- Users can enable/disable notifications and change their preferred time in Profile → Notifications
- Powered by edge functions (`supabase/functions/dispatch-plant-reminders`) that run on a cron schedule
- Note: Notification titles display "Incoming message" with plant details in the body (iOS PWA limitation)
- See also: Spray Reminders below, which use the same dispatch cron and time-slot mechanism

#### Spray Reminders
A standalone, per-home reminder to mist plants — independent of any single plant's watering schedule.
- Toggle on/off and set an interval (2–10, 12, or 14 days) in Profile → Notifications
- Home-scoped: stored in the `home_spray_preferences` table (`enabled`, `interval_days`, `last_sprayed_date`), so each home a user belongs to can have its own schedule
- Dispatched from the same `dispatch-plant-reminders` cron run as watering/replanting, deduped per user per day via `notification_dispatch_log` (kind `spray_due`)
- The Plants page shows a "Spray" button next to Add Plant when enabled. Before it's due, a small green counter circle (matching the plant-tile leaf color) shows the number of days left; when due, the counter is replaced by a warning dot. Tapping it marks the plants sprayed and resets the countdown without waiting for the push. The spray interval is changed only from Profile → Notifications

#### Performance Optimizations
- **Self-Hosted Fonts:** Google Fonts (Caveat, DM Sans, Fraunces) are bundled locally in `public/fonts/` instead of loaded via render-blocking third-party CDN requests. Eliminates ~200–400ms of DNS+TLS+font-fetch overhead on every cold PWA launch.
- **Cache-First Service Worker:** Navigation requests use cache-first strategy with background revalidation. App shell renders instantly from cache on repeat visits (~50ms), while background fetch updates the cache. New deployments apply on the next app launch (one-visit lag for consistency).
- **Instant cold-start paint:** `index.html` inlines a critical `background-color` (`#ECEFE7`) in a `<style>` tag so the very first paint is the app color, not the browser's default white, before the external CSS bundle downloads. The PWA manifest's `background_color` matches so the iOS launch/splash screen is the same color (the app has no dark-mode toggle, so light is always correct). `start_url` is `/plants` so a logged-in installed app lands directly instead of taking an extra auth-gated `/` → `/plants` redirect hop. **Note:** manifest changes (`background_color`, `start_url`) are read by iOS at install time — remove and re-add the home-screen app to pick them up.
- **Non-blocking auth gate:** The initial render restores the Supabase session *synchronously* from `localStorage` (`readStoredSession()` in `src/App.tsx`) instead of awaiting `supabase.auth.getSession()`. That async call serializes token access behind the Web Locks API (`navigator.locks`), which can hang on iOS PWAs when a lock held by a killed webview context is never released — the classic "blank screen until you switch pages" symptom. The async flow still runs afterward to verify the session (and sign out if invalid). A 2s watchdog force-opens the gate as a backstop for the no-stored-session path so it can never hang indefinitely.

#### Theme Token System
Brand colors and spacing are defined in `src/lib/theme-tokens.ts` and injected at runtime as inline styles. CSS tokens (e.g., `--background-overlay`, `--text-control-error`) exist only in `src/index.css` and are used locally. This keeps the design system centralized while avoiding duplication.

#### Text Selection Prevention
Plant cards and bottom sheets disable text selection during long-press interactions to improve touch UX, especially on iOS where selection can interfere with delete mode.

### Security

- Supabase client is only exposed globally in development (`src/integrations/supabase/client.ts`)
- RLS policies enforce user/home ownership on all database operations
- Vercel deployment includes security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000` (enforces HTTPS)
  - Asset caching: `/assets/*` cached immutably for 1 year

### Edge Functions

Located in `supabase/functions/`, these Deno-based serverless functions handle background tasks:

- `dispatch-plant-reminders` — cron-triggered, sends scheduled notifications to all users
- `send-push-notification` — on-demand function to send test notifications (requires user auth)
- `notification-preferences` — GET/POST user notification settings

**Type Checking:** All edge functions use TypeScript with lenient type checking (`supabase/functions/deno.json` sets `"strict": false`). This allows real type verification without breaking dynamic query patterns. Before deploying, verify with:

```sh
deno check supabase/functions
```

## Testing

Plant status logic (watering and replanting intervals) is covered by tests in `src/lib/plant-utils.test.ts`:

```sh
npm run test
```

Run tests in watch mode during development:

```sh
npm run test -- --watch
```

## Deployment

### Vercel (Frontend)

```sh
vercel deploy
```

Deployments automatically include security headers and asset caching per `vercel.json`.

### Supabase Edge Functions

Before deploying, verify edge functions:

```sh
deno check supabase/functions
```

Deploy individual functions:

```sh
supabase functions deploy dispatch-plant-reminders
supabase functions deploy send-push-notification
supabase functions deploy notification-preferences
```

Or deploy all:

```sh
supabase functions deploy
```

Set required secrets before deploying push notification functions:

```sh
supabase secrets set VAPID_PUBLIC_KEY=<your-public-key>
supabase secrets set VAPID_PRIVATE_KEY=<your-private-key>
supabase secrets set VAPID_SUBJECT=mailto:your-email@example.com
supabase secrets set CRON_SECRET=<strong-random-secret>
```

## Development Guidelines

### Toast Messages
Use `src/lib/app-toast.ts` helpers (`toast.success()`, `toast.error()`, `toast.info()`). Only one toast displays at a time; the library automatically dismisses previous toasts before showing new ones.

### Confirm-to-Save Pattern
Edits to plant name, home name, profile name, password, and home-sharing invites all use the same confirm-to-save pattern: changes are buffered locally in component state and only committed when a green checkmark button (shown next to the close/back action) is tapped. Navigating away or dismissing the sheet/page without tapping it discards the buffered edit. This avoids accidental rapid writes and gives clear visual feedback on save.

### Notification Timing
Notifications are dispatched in CET (Central European Time) at your chosen slot time (9:00, 14:00, or 20:00). The scheduler tolerates up to 60 minutes of jitter from the cron runner and uses a dispatch log to prevent duplicate sends on the same day.

### Bottom Sheets
All bottom sheets (modals) are capped at `max-w-[720px]` to match the app's content max-width on desktop. This prevents sheets from spanning the full browser width.

### Scroll Behavior
The app resets `window` scroll to the top on every route change and sets `history.scrollRestoration` to `manual`, since client-side navigation and PWA app-switching don't reset scroll position on their own. The native scrollbar is hidden app-wide (via `scrollbar-width: none` / `::-webkit-scrollbar`) for a more native-app feel; scrolling itself is unaffected.

## Push Notifications (MVP)

1. Copy `.env.example` to `.env`.
2. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Add `VITE_VAPID_PUBLIC_KEY` (public key from your web-push VAPID keypair).
4. Open Profile -> Notifications and tap Enable.

### Push Sender Function

1. Set Edge Function secrets:
	- `supabase secrets set VAPID_PUBLIC_KEY=...`
	- `supabase secrets set VAPID_PRIVATE_KEY=...`
	- `supabase secrets set VAPID_SUBJECT=mailto:you@example.com`
2. Deploy function:
	- `supabase functions deploy send-push-notification --no-verify-jwt=false`
3. In app, open Profile -> Notifications and enable notifications; reminders are delivered on your chosen schedule.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
