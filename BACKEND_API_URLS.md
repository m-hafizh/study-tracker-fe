# Backend API URLs Required by Frontend

This document lists the backend endpoints needed by the current frontend implementation in `study-tracker`.

## API base and headers

- Base URL is read from `VITE_BASE_API_URL` and the frontend appends `/v1` in `src/configs/api.config.ts`
- Requests include:
  - `Content-Type: application/json`
  - `API-Key: <VITE_PRIVATE_API_KEY>` (optional)
  - `Authorization: Bearer <access_token>` (for protected endpoints)

## Contract assumptions

- All response timestamps use ISO 8601 strings.
- IDs are strings.
- Date-only fields use `YYYY-MM-DD`.
- Time-only fields use `HH:mm` or `HH:mm:ss` where noted.

---

## 1) User authentication endpoints (new)

These routes are required to support user auth and user-scoped data for all study resources.

### 1.1 Register
- **Method**: `POST`
- **URL**: `/v1/auth/register`
- **Body**:
```json
{
  "name": "string",
  "email": "user@example.com",
  "password": "string(min 8)"
}
```
- **Response**:
```json
{
  "user": { "id": "string", "name": "string", "email": "user@example.com" },
  "accessToken": "jwt",
  "refreshToken": "jwt-or-random-token"
}
```

### 1.2 Login
- **Method**: `POST`
- **URL**: `/v1/auth/login`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "string"
}
```
- **Response**: same shape as register

### 1.3 Refresh token
- **Method**: `POST`
- **URL**: `/v1/auth/refresh`
- **Body**:
```json
{ "refreshToken": "string" }
```
- **Response**:
```json
{ "accessToken": "jwt", "refreshToken": "string" }
```

### 1.4 Logout
- **Method**: `POST`
- **URL**: `/v1/auth/logout`
- **Body**:
```json
{ "refreshToken": "string" }
```
- **Response**: `204 No Content`

### 1.5 Current user profile
- **Method**: `GET`
- **URL**: `/v1/auth/me`
- **Auth**: required
- **Response**:
```json
{ "id": "string", "name": "string", "email": "user@example.com" }
```

### 1.6 Update current user profile
- **Method**: `PATCH`
- **URL**: `/v1/auth/me`
- **Auth**: required
- **Body**:
```json
{ "name"?: "string", "email"?: "user@example.com" }
```

### 1.7 Change password
- **Method**: `POST`
- **URL**: `/v1/auth/change-password`
- **Auth**: required
- **Body**:
```json
{ "currentPassword": "string", "newPassword": "string(min 8)" }
```

---

## 2) Todo endpoints (already wired in frontend)

**Auth**: required (all routes below)

Used by:
- `src/api/todos/*`
- `src/hooks/todos/*`

### 1.1 List todos (paged)
- **Method**: `GET`
- **URL**: `/v1/todos`
- **Query params**:
  - `completed?: boolean`
  - `page?: number` (default frontend: `1`)
  - `limit?: number` (default frontend: `10`)
  - `sort?: "title" | "date"` (frontend supports this)
  - `order?: "asc" | "desc"` (frontend supports this)
- **Response**:
```json
{
  "todos": [{ "id": "string", "title": "string", "completed": false, "date": "2026-04-21" }],
  "totalTodos": 0,
  "hasNextPage": false,
  "nextPage": null
}
```

### 1.2 List todos (infinite scroll)
- **Method**: `GET`
- **URL**: `/v1/todos/scroll`
- **Query params**:
  - `completed?: boolean`
  - `nextCursor?: number`
  - `limit?: number`
- **Response**:
```json
{
  "todos": [{ "id": "string", "title": "string", "completed": false, "date": "2026-04-21" }],
  "nextCursor": null,
  "hasNextPage": false
}
```

### 1.3 Create todo
- **Method**: `POST`
- **URL**: `/v1/todos`
- **Body**:
```json
{ "title": "string", "completed": false }
```
- **Response**: created todo object

### 1.4 Update todo
- **Method**: `PUT`
- **URL**: `/v1/todos/{id}`
- **Body**:
```json
{ "title": "string", "completed": true }
```
- **Response**: updated todo object

### 1.5 Delete todo
- **Method**: `DELETE`
- **URL**: `/v1/todos/{id}`
- **Response**: `{ "id": "..." }` or `204 No Content`

---

## 3) Study sessions / history endpoints (required)

**Auth**: required (all routes below)

Used by:
- `src/stores/useHistoryStore.ts`
- `src/pages/Study-Tracker/history/*`
- `src/pages/Study-Tracker/study-session/*`
- `src/pages/Study-Tracker/pomodoro/index.tsx`
- `src/pages/Study-Tracker/components/Dashboard.tsx`

Data shape:
```json
{
  "id": "string",
  "subject": "string",
  "topic": "string",
  "startTime": "09:00",
  "endTime": "10:00",
  "durationMinutes": 60,
  "date": "2026-04-21",
  "notes": "string"
}
```

### 2.1 List study sessions
- **Method**: `GET`
- **URL**: `/v1/study-sessions`
- **Query params** (recommended):
  - `from?: YYYY-MM-DD`
  - `to?: YYYY-MM-DD`
  - `subject?: string`
  - `search?: string`
  - `page?: number`
  - `limit?: number`
- **Response**:
```json
{ "items": ["...session"], "total": 0 }
```

### 2.2 Create study session
- **Method**: `POST`
- **URL**: `/v1/study-sessions`
- **Body**: session fields except `id`
- **Response**: created session

### 2.3 Update study session
- **Method**: `PUT` (or `PATCH`)
- **URL**: `/v1/study-sessions/{id}`
- **Body**: editable session fields
- **Response**: updated session

### 2.4 Delete study session
- **Method**: `DELETE`
- **URL**: `/v1/study-sessions/{id}`
- **Response**: `204 No Content`

---

## 4) Subject endpoints (required)

**Auth**: required (all routes below)

Used by:
- `src/stores/useSubjectStore.ts`
- `src/pages/Study-Tracker/subject/*`
- `src/pages/Study-Tracker/study-session/components/StartStudyForm.tsx`

Data shape:
```json
{ "id": "string", "subject": "Math", "color": "#264de4" }
```

### 3.1 List subjects
- **Method**: `GET`
- **URL**: `/v1/subjects`

### 3.2 Create subject
- **Method**: `POST`
- **URL**: `/v1/subjects`
- **Body**:
```json
{ "subject": "string", "color": "#RRGGBB" }
```

### 3.3 Update subject
- **Method**: `PUT` (or `PATCH`)
- **URL**: `/v1/subjects/{id}`
- **Body**: `{ "subject"?: "string", "color"?: "#RRGGBB" }`

### 3.4 Delete subject
- **Method**: `DELETE`
- **URL**: `/v1/subjects/{id}`

---

## 5) Calendar event endpoints (required)

**Auth**: required (all routes below)

Used by:
- `src/stores/useCalendarStore.ts`
- `src/pages/Study-Tracker/calendar/index.tsx`

Data shape:
```json
{
  "id": "string",
  "title": "Review Calculus Chapter 4",
  "subject": "Math",
  "date": "2026-04-21",
  "startTime": "19:00",
  "endTime": "20:00",
  "allDay": false,
  "color": "#8b5cf6",
  "notes": "Focus on integration by parts.",
  "createdAt": "2026-04-21T10:00:00.000Z",
  "updatedAt": "2026-04-21T10:00:00.000Z"
}
```

### 4.1 List events
- **Method**: `GET`
- **URL**: `/v1/calendar/events`
- **Query params** (recommended):
  - `from?: YYYY-MM-DD`
  - `to?: YYYY-MM-DD`
  - `subject?: string`

### 4.2 Create event
- **Method**: `POST`
- **URL**: `/v1/calendar/events`

### 4.3 Update event
- **Method**: `PUT` (or `PATCH`)
- **URL**: `/v1/calendar/events/{id}`

### 4.4 Delete event
- **Method**: `DELETE`
- **URL**: `/v1/calendar/events/{id}`

### 4.5 Clear all events
- **Method**: `DELETE`
- **URL**: `/v1/calendar/events`

---

## 6) Kanban endpoints (required)

**Auth**: required (all routes below)

Used by:
- `src/stores/useKanbanStore.ts`
- `src/pages/Study-Tracker/kanban/*`

Frontend behavior includes:
- board title rename/reset
- list CRUD + reorder
- card CRUD + move between lists + reorder within list

### Option A (recommended): board snapshot API

This best matches the current frontend store behavior.

#### 5.1 Get board
- **Method**: `GET`
- **URL**: `/v1/kanban/board`
- **Response**:
```json
{
  "id": "string",
  "title": "Study Planner",
  "createdAt": "ISO",
  "updatedAt": "ISO",
  "lists": [
    {
      "id": "string",
      "title": "To Do",
      "createdAt": "ISO",
      "updatedAt": "ISO",
      "cards": [
        {
          "id": "string",
          "title": "Task",
          "subject": "Math",
          "notes": "...",
          "estimateMinutes": 30,
          "dueDate": "2026-04-22",
          "priority": "low",
          "createdAt": "ISO",
          "updatedAt": "ISO"
        }
      ]
    }
  ]
}
```

#### 5.2 Replace board snapshot
- **Method**: `PUT`
- **URL**: `/v1/kanban/board`
- **Body**: full board object

#### 5.3 Reset board (optional explicit route)
- **Method**: `POST`
- **URL**: `/v1/kanban/board/reset`

### Option B: granular APIs (if backend prefers normalized model)

- `POST /v1/kanban/lists`
- `PATCH /v1/kanban/lists/{listId}`
- `DELETE /v1/kanban/lists/{listId}`
- `POST /v1/kanban/lists/reorder`
- `POST /v1/kanban/lists/{listId}/cards`
- `PATCH /v1/kanban/lists/{listId}/cards/{cardId}`
- `DELETE /v1/kanban/lists/{listId}/cards/{cardId}`
- `POST /v1/kanban/cards/{cardId}/move`

Either Option A or B is sufficient; Option A minimizes frontend refactor.

---

## 7) Settings endpoints (required)

**Auth**: required (all routes below)

Used by:
- `src/stores/useSettingsStore.ts`
- `src/pages/Study-Tracker/components/Dashboard.tsx`

Current persisted setting:
```json
{ "dailyTargetMinutes": 60 }
```

### 6.1 Get study settings
- **Method**: `GET`
- **URL**: `/v1/settings/study`

### 6.2 Update study settings
- **Method**: `PUT` (or `PATCH`)
- **URL**: `/v1/settings/study`
- **Body**:
```json
{ "dailyTargetMinutes": 90 }
```

---

## 8) Optional but useful analytics endpoint

**Auth**: required

The dashboard currently computes totals client-side from full session history. For performance, backend can provide aggregate stats.

### 7.1 Dashboard summary
- **Method**: `GET`
- **URL**: `/v1/analytics/study-summary`
- **Query params**:
  - `date?: YYYY-MM-DD` (for "today")
  - `weekStart?: YYYY-MM-DD`
- **Response**:
```json
{
  "todayMinutes": 0,
  "weeklyMinutes": 0,
  "currentStreak": 0,
  "longestStreak": 0,
  "last7Days": [
    { "date": "2026-04-15", "minutes": 25 }
  ]
}
```

---

## 9) Suggested implementation order

1. Auth endpoints (`/v1/auth/*`) and access-token middleware.
2. Todo endpoints (`/v1/todos`, `/v1/todos/scroll`) — already used by Axios wrappers.
3. Subject + Study sessions (`/v1/subjects`, `/v1/study-sessions`) — powers study flow + history + dashboard.
4. Calendar events (`/v1/calendar/events`).
5. Kanban (`/v1/kanban/board` snapshot route first).
6. Settings (`/v1/settings/study`).
7. Optional analytics summary (`/v1/analytics/study-summary`).

---

## Notes

- Existing frontend state for non-todo features is local-only today (Zustand + localStorage/service helpers). The endpoints above are what backend should expose when those stores are migrated to server persistence.
- Every protected resource endpoint must be user-scoped from the auth context (do not accept `userId` from request body/query).
- Keep `API-Key` support if needed for platform-level validation, but user authorization should be enforced with bearer access tokens.
