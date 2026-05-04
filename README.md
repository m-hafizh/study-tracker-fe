# Study Tracker Frontend (`fe`)

Frontend for a full-stack study productivity app with auth, calendar planning, kanban workflow, history tracking, subject management, profile/settings, and pomodoro timer.

## Core stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS + shadcn/ui (Radix primitives)
- Zustand for app state
- Axios for API integration
- React Hook Form + Zod
- DnD Kit for Kanban drag/drop
- Sonner for toast notifications

## Main features

- Auth: register, login, logout, session bootstrap, protected areas.
- Dashboard with study summaries.
- Study session flow (start → timer → save).
- History CRUD (add/edit/delete study sessions).
- Subject CRUD (with first-subject empty-state CTA).
- Calendar CRUD with month grid + upcoming panel.
- Kanban board with list/card management and drag/drop.
- Pomodoro timer with history integration.
- Profile and change-password pages.

## Recent UX + reliability updates

- Global form/action feedback standardization:
  - loading/disabled controls during async actions
  - success/error/offline toasts
  - close dialogs only on successful operations
- Calendar hardening:
  - friendly validation for timed events (start/end required, valid range)
  - sanitized error display (no raw Prisma/internal error leaks)
- Calendar upcoming list polish:
  - stronger hover contrast
  - pencil affordance icon on hover/focus
- Auth/profile polish:
  - friendlier errors and disabled actions while submitting

## Project structure (high level)

```text
fe/
├── src/
│   ├── api/                 # API client + per-domain endpoints
│   ├── components/          # layout/custom/ui components
│   ├── features/            # offline sync + feature modules
│   ├── hooks/               # shared and feature hooks
│   ├── lib/                 # utilities (e.g. form-feedback)
│   ├── models/              # TS models
│   ├── pages/               # route pages (auth + Study-Tracker/*)
│   ├── stores/              # Zustand stores
│   └── utils/
├── DOCUMENTATION.md         # detailed frontend docs
└── BACKEND_API_URLS.md      # endpoint contracts used by frontend
```

## Environment

Configured via Vite env variables (see `src/configs/api.config.ts`):

- `VITE_BASE_API_URL`
- `VITE_PRIVATE_API_KEY` (optional/private header flow)

## Runtime requirements

- Node.js `v22.12.0`
- nvm (Node Version Manager)

## Scripts

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm preview
```

## Local run

```bash
# switch Node.js runtime
nvm use v22.12.0

# install deps
pnpm install

# run app
pnpm dev
```

App default: `http://localhost:5173`

## Related docs

- `DOCUMENTATION.md` (detailed frontend architecture)
- `BACKEND_API_URLS.md` (API contracts)
- `../api/DOCUMENTATION.md` (backend module + route docs)
