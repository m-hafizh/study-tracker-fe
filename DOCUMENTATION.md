# 📚 Study Tracker — Project Documentation

> ✅ **Current status update (April 2026)**
>
> This document was started early in development. Some sections below are historical and may mention TODO/WIP modules that have since evolved.
>
> Use this snapshot as the source of truth for current implementation:
>
> - **Implemented route groups**: `auth/*`, `Study-Tracker/*` including `calendar`, `kanban`, `history`, `subject`, `study-session`, `pomodoro`, `profile`, `change-password`, `settings`.
> - **State stores actively used**: `useAuthStore`, `useCalendarStore`, `useHistoryStore`, `useKanbanStore`, `useSettingsStore`, `useStudySessionStore`, `useSubjectStore`.
> - **UX standardization completed**:
>   - loading/disabled states for form and destructive actions
>   - consistent success/error/offline toasts via `src/lib/form-feedback.ts`
>   - close dialogs only on success; keep open on failure
> - **Calendar reliability fixes completed**:
>   - frontend blocks invalid non all-day submissions (requires valid start/end range)
>   - backend returns friendly validation errors (no raw Prisma internals)
>   - frontend sanitizes technical error strings before displaying toast fallback
> - **Recent visual polish**:
>   - calendar upcoming cards now use higher-contrast hover styles
>   - pencil edit affordance appears on hover/focus in upcoming list


## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Pages & Routing](#pages--routing)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Data Models](#data-models)
- [Custom Hooks](#custom-hooks)
- [Utility Functions](#utility-functions)
- [UI & Components](#ui--components)
- [Environment Configuration](#environment-configuration)
- [Scripts](#scripts)
- [Getting Started](#getting-started)

---

## Overview

**Study Tracker** is a single-page web application that helps students track and manage their study sessions. Users can start a timed study session for a given subject and topic, watch a countdown timer, save session notes when finished, and review their study history — all through a clean, responsive dashboard with charts.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Language** | TypeScript (~5.7) |
| **UI Framework** | React 19 |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 4 + shadcn/ui (Radix primitives + CVA) |
| **Routing** | React Router DOM 7 + `vite-plugin-pages` (file-based routing) |
| **State Management** | Zustand 5 |
| **Server State / Data Fetching** | TanStack React Query 5 + Axios |
| **Forms & Validation** | React Hook Form 7 + Zod 4 |
| **Charts** | Recharts 3 |
| **Date / Time** | Moment.js, date-fns |
| **Drag & Drop** | @dnd-kit |
| **Icons** | Tabler Icons, Lucide React, React Icons |
| **Animation** | Motion (Framer Motion) |
| **Linting** | ESLint 9 + TypeScript ESLint + Prettier |
| **Package Manager** | yarn |

---

## Project Structure

```
study-tracker/
├── public/                     # Static assets served by Vite
├── src/
│   ├── api/                    # Axios instance & API call functions
│   │   ├── index.ts            # Custom Axios instance (baseURL, API-Key header)
│   │   └── todos/              # CRUD API helpers for Todos
│   ├── assets/                 # Images, SVGs, etc.
│   ├── components/
│   │   ├── core/               # App-wide components (LoginForm, NavigationBar)
│   │   ├── custom/             # Reusable custom components (Header, Button, CustomSelect…)
│   │   └── ui/                 # shadcn/ui primitives (Button, Card, Dialog, Select, Table, Progress…)
│   ├── configs/
│   │   └── api.config.ts       # Reads VITE_BASE_API_URL & VITE_PRIVATE_API_KEY from env
│   ├── constants/              # Static data (e.g. payments)
│   ├── context/                # React Context providers (placeholder)
│   ├── features/               # Feature modules (calendar, dashboard, todo — placeholder)
│   ├── hooks/
│   │   ├── pomodoro/           # useCountdownTimer, useStreak, useTimer
│   │   ├── todos/              # useCreateTodo, useDeleteTodo, useGetTodos, useScrollTodos
│   │   ├── use-dialog.ts
│   │   ├── use-mobile.ts
│   │   └── usePagination.ts
│   ├── lib/                    # Shared library code
│   ├── models/                 # TypeScript type definitions
│   │   ├── todo.ts             # Todo, NewTodo
│   │   ├── pomodoro/index.ts   # TimerSession, StreakData, PomodoroStats
│   │   └── taskflow/index.ts   # Tasks, Status
│   ├── pages/                  # File-based routing (vite-plugin-pages)
│   │   ├── index.tsx           # Home / Welcome page
│   │   └── Study-Tracker/
│   │       ├── index.tsx       # Dashboard page
│   │       ├── components/
│   │       │   └── Dashboard.tsx  # Charts + summary cards
│   │       ├── history/        # Study session history list
│   │       ├── kanban/         # Trello-like study planning board
│   │       ├── study-session/  # Start → Timer → Save flow
│   │       └── subject/        # Subject CRUD list
│   ├── services/               # (placeholder)
│   ├── stores/
│   │   ├── index.ts
│   │   └── useStudySessionStore.ts  # Zustand store for study-session flow
│   ├── styles/                 # Global / shared styles
│   ├── types/                  # Additional TS types
│   ├── utils/
│   │   ├── schema.ts           # Shared Zod schemas
│   │   └── time.ts             # diffTime, durationFormat, convertTime, timeToSeconds
│   ├── App.tsx                 # Legacy App wrapper (kept for reference)
│   ├── main.tsx                # Entry point — React 19 root, QueryClient, BrowserRouter
│   └── routes.tsx              # Cleans auto-generated routes from vite-plugin-pages
├── .env / .env.development / .env.production
├── eslint.config.js
├── vite.config.ts              # Vite plugins: Tailwind, React, SVGR, AutoImport, Pages
├── tsconfig.json               # Path alias: @/* → ./src/*
├── package.json
└── yarn.lock
```

---

## Features

### 1. Dashboard (`/study-tracker`)
- Displays summary cards: **Today's Total Study Time** and **Weekly Study Summary**.
- Shows a **line chart** (Recharts) of study time over months.
- "Start Studying" button navigates to the study-session flow.

### 2. Study Session (`/study-tracker/study-session`)
A three-step flow managed by Zustand flags (`isStartStudy`, `isStudying`, `isSaveStudy`):

| Step | Component | Description |
|---|---|---|
| **Start** | `StartStudyForm` | Pick a subject (combobox), enter a topic, choose a duration (preset or custom time-picker). Validated with Zod. |
| **Timer** | `StudyingTimer` | Countdown timer with Pause / Resume / Stop buttons. Auto-stops when time reaches 0. |
| **Save** | `SaveStudyForm` | Displays session summary (subject, topic, start/end time, actual duration). Add optional notes and save. |

### 3. History (`/study-tracker/history`)
- Table view of past study sessions (subject, topic, time, duration, date, notes).
- CRUD modals: **FormModal** (create/edit), **DeleteModal**.

### 4. Subject Management (`/study-tracker/subject`)
- Table listing subjects with a colour indicator.
- CRUD modals for adding / editing / deleting subjects.

### 5. Kanban Study Planner (`/study-tracker/kanban`)
- Trello-like board for planning study tasks.
- Default columns: **To Do**, **In Progress**, **Done**.
- User can fully customize workflow columns (add / rename / reorder / delete).
- Cards support title, subject, notes, estimate, due date, and priority.
- **Phase B implemented:** drag-and-drop for columns and cards (including cross-column move), with persistence.

### 6. Navigation
- Responsive **Header** with desktop horizontal nav and mobile drawer menu.
- Pages: Dashboard, History, Subject, Kanban, Start Study, Pomodoro.

### 7. Pomodoro Hooks (WIP / reusable)
- `useCountdownTimer` — generic countdown with start / pause / reset / setMinutes.
- `useStreak` — track study streak data.
- `useTimer` — generic timer utilities.

### 8. Todo Module (API-connected)
- Full CRUD via Axios (`createTodo`, `getTodos`, `getScrollTodos`, `updateTodo`, `deleteTodo`).
- React Query hooks: `useCreateTodo`, `useDeleteTodo`, `useGetTodos`, `useScrollTodos`.

---

## Pages & Routing

Routing is **file-based** via `vite-plugin-pages`. Every file under `src/pages/` automatically becomes a route. The `src/routes.tsx` file cleans the auto-generated route tree (strips internal `components` folders) and adds a catch-all redirect to `/`.

| URL Path | Page Component |
|---|---|
| `/` | `pages/index.tsx` — Welcome page |
| `/study-tracker` | `pages/Study-Tracker/index.tsx` — Dashboard |
| `/study-tracker/kanban` | `pages/Study-Tracker/kanban/index.tsx` |
| `/study-tracker/study-session` | `pages/Study-Tracker/study-session/index.tsx` |
| `/study-tracker/history` | `pages/Study-Tracker/history/index.tsx` |
| `/study-tracker/subject` | `pages/Study-Tracker/subject/index.tsx` |
| `*` (catch-all) | Redirects to `/` |

---

## State Management

### Zustand Store — `useStudySessionStore`

Manages the study-session wizard flow:

```ts
// State
subject, topic, duration, startTime, endTime,
isStartStudy, isStudying, isSaveStudy, note, createdAt

// Actions
saveAndStartStudySession(data)  // Sets session data & start time
updateStudySession(partial)     // Merges partial updates
```

The three boolean flags (`isStartStudy`, `isStudying`, `isSaveStudy`) act as a simple state machine driving which form/component is displayed.

---

## API Layer

| File | Purpose |
|---|---|
| `src/configs/api.config.ts` | Reads `VITE_BASE_API_URL` and `VITE_PRIVATE_API_KEY` from environment |
| `src/api/index.ts` | Creates a shared Axios instance with `baseURL` and `API-Key` header |
| `src/api/todos/*` | Individual API call functions for CRUD on Todos |

Server state is cached and synchronised with **TanStack React Query** via custom hooks in `src/hooks/todos/`.

---

## Data Models

### `Todo`
```ts
{ id: string; title: string; completed: boolean; date: string }
```

### `TimerSession` (Pomodoro)
```ts
{ id: string; type: "Focus" | "Break"; duration: number; startedAt: Date; endedAt?: Date; completed: boolean }
```

### `StreakData`
```ts
{ currentStreak: number; longestStreak: number; lastStudyDate: string }
```

### `Tasks` (Taskflow)
```ts
{ id, projectId, title, description, assigneeId, statusId, statusName, statusTitle, priority, createdAt, updatedAt, dueDate }
```

---

## Custom Hooks

| Hook | Location | Purpose |
|---|---|---|
| `useCountdownTimer` | `hooks/pomodoro/` | Countdown timer with start/pause/reset, configurable minutes, `onComplete` callback |
| `useStreak` | `hooks/pomodoro/` | Track daily study streaks |
| `useTimer` | `hooks/pomodoro/` | General-purpose timer |
| `useCreateTodo` | `hooks/todos/` | React Query mutation — create a todo |
| `useDeleteTodo` | `hooks/todos/` | React Query mutation — delete a todo |
| `useGetTodos` | `hooks/todos/` | React Query query — fetch all todos |
| `useScrollTodos` | `hooks/todos/` | React Query infinite query — paginated/scroll todos |
| `usePagination` | `hooks/` | Client-side pagination logic |
| `use-dialog` | `hooks/` | Dialog open/close state |
| `use-mobile` | `hooks/` | Detect mobile viewport |

---

## Utility Functions

### `src/utils/time.ts`

| Function | Description |
|---|---|
| `diffTime(start, end)` | Calculates difference between two time strings; returns `{ value, unit }` |
| `durationFormat(time)` | Converts a duration string into `{ value, unit }` |
| `convertTime(seconds)` | Formats seconds into `HH:MM:SS` display |
| `timeToSeconds(duration)` | Parses a `HH:MM:SS` string into total seconds |

### `src/utils/schema.ts`
Shared Zod schemas used across forms.

---

## UI & Components

### Component Library
The project uses **shadcn/ui** (Radix UI primitives + Class Variance Authority + Tailwind CSS v4) as its component system. Components live in `src/components/ui/` and are styled with Tailwind utility classes via a `cn()` helper (clsx + tailwind-merge).

### Key Custom Components

| Component | Path | Description |
|---|---|---|
| `Header` | `components/custom/Header.tsx` | Responsive nav bar with desktop menu + mobile drawer |
| `Button` | `components/custom/Button.tsx` | Custom button wrapper |
| `CustomSelect` | `components/custom/CustomSelect.tsx` | Enhanced select input |
| `ListTable` | `pages/*/components/ListTable.tsx` | Reusable data table with configurable headers |
| `FormModal` | `pages/*/components/FormModal.tsx` | Modal dialog for create/edit forms |
| `DeleteModal` | `pages/*/components/DeleteModal.tsx` | Confirmation modal for deletions |
| `TimePicker` | `study-session/components/TimePicker.tsx` | Custom time duration picker |
| `Toaster` | `components/ui/toaster.tsx` | Toast notification system |

---

## Environment Configuration

Three `.env` files support different modes:

| File | `VITE_BASE_API_URL` | Notes |
|---|---|---|
| `.env` | `http://localhost:8080` | Default |
| `.env.development` | `http://localhost:8080` | `yarn dev` |
| `.env.production` | `https://localhost:8081` | `yarn prod` / `yarn build` |

Both files also define `VITE_PRIVATE_API_KEY`.

---

## Scripts

```bash
yarn dev        # Start dev server (development mode)
yarn prod       # Start dev server (production mode)
yarn build      # Type-check + production build
yarn lint       # Run ESLint
yarn preview    # Preview production build locally
```

---

## Getting Started

```bash
# 1. Install dependencies
yarn install

# 2. Start the development server
yarn dev

# 3. Open in browser
#    → http://localhost:5173
```

---

> **Note:** This project is actively under development. Some features (calendar, full dashboard analytics, profile/settings pages, taskflow board) are scaffolded but not yet fully implemented.
