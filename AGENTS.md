# AGENTS.md — Repensar Multiplatform Compose

This file contains guidelines for agentic coding agents working in this repository.

---

## Project Overview

This is a **Kotlin Multiplatform Compose** monorepo. The active web application lives in `webApp/` and is a **Next.js 15 App Router** application using React 19, TypeScript 5, Tailwind CSS v4, and shadcn/ui. The `composeApp/`, `shared/`, and `iosApp/` directories contain Kotlin/iOS scaffold stubs that are not currently active.

**All web development work targets `webApp/`.**

---

## Build / Lint / Test Commands

All commands must be run from the `webApp/` directory unless noted. The project uses **pnpm** exclusively (`preinstall` hook enforces it).

```bash
# Development server (Turbopack)
pnpm dev

# Production build (pulls i18n translations first)
pnpm build

# Linting (Next.js ESLint)
pnpm lint

# Start production server
pnpm start
```

**No testing framework is configured.** There are no Jest, Vitest, or Playwright test files or configs. Do not add test scripts without explicit instruction.

**Adding shadcn components:**
```bash
pnpm shadcn add <component-name>
```

---

## Repository Structure

```
webApp/
├── src/
│   ├── app/[locale]/          # Next.js App Router routes (i18n-prefixed)
│   │   ├── (landing)/         # Public landing page route group
│   │   ├── login/ register/   # Auth pages
│   │   ├── portal/            # Protected portal (sidebar layout)
│   │   │   ├── page.tsx       # Dashboard (role-based)
│   │   │   ├── my-tasks/
│   │   │   ├── my-hours/
│   │   │   ├── available-tasks/
│   │   │   ├── achievements/
│   │   │   ├── leaderboards/
│   │   │   ├── projects/ tasks/ volunteers/ resources/
│   │   │   └── settings/ profile/
│   │   └── globals.css
│   ├── i18n/                  # next-intl routing config
│   └── middleware.ts
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── shared/                # PageHeader, StatCard, FilterBar
│   ├── dashboards/            # Role-specific dashboard components
│   └── [feature]/             # Feature components (tasks/, volunteers/, etc.)
├── lib/
│   ├── api/
│   │   ├── client.ts          # ApiClient singleton (fetch-based)
│   │   ├── types.ts           # All TypeScript types/enums
│   │   ├── index.ts           # Barrel export
│   │   └── [domain].ts        # Domain API modules
│   └── hooks/
│       ├── useAuth.tsx        # AuthContext + AuthProvider
│       └── useLoading.tsx     # LoadingContext + LoadingProvider
├── messages/
│   ├── en.json                # English translations
│   └── pt.json                # Portuguese translations
└── package.json
```

---

## Code Style Guidelines

### TypeScript

- **Strict mode is enabled** (`strict: true`, `noUnusedLocals`, `noUnusedParameters`). All code must pass strict checks — no `any` unless absolutely necessary.
- Use `interface` for object shapes; use `type` for unions, intersections, or aliases.
- Prefer named types over inline types in function signatures.
- Enums use PascalCase names with SCREAMING_SNAKE values: `TaskStatus.IN_PROGRESS`.
- All API types live in `lib/api/types.ts`. Create/Update variants are separate interfaces with optional fields on Update:
  ```ts
  interface TaskCreate { title: string; project_id: number; }
  interface TaskUpdate { title?: string; status?: TaskStatus; }
  ```

### Imports

- Use the `@/` path alias for all non-relative imports. `@/` maps to the `webApp/` root.
  ```ts
  import { cn } from '@/lib/utils';
  import { tasksApi } from '@/lib/api';
  import { PageHeader } from '@/components/shared/page-header';
  ```
- Import i18n navigation from the custom module (include `.ts` extension):
  ```ts
  import { useRouter, usePathname } from '@/src/i18n/navigation.ts';
  ```
- Group imports: external packages first, then internal `@/` imports.

### Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `TaskCard`, `PageHeader` |
| Files | kebab-case | `task-card.tsx`, `page-header.tsx` |
| Hooks | camelCase, `use` prefix | `useAuth`, `useLoading` |
| API modules | camelCase, `Api` suffix | `tasksApi`, `volunteersApi` |
| Types/Interfaces | PascalCase | `TaskSummary`, `VolunteerProfile` |
| Pages | `page.tsx` | `portal/my-tasks/page.tsx` |
| Layouts | `layout.tsx` | `portal/layout.tsx` |

### Component Structure

All portal/feature components use `'use client'` at the top. Named exports for components; default exports for page files.

```tsx
'use client';

import { ... } from '...';

interface MyComponentProps {
    propA: string;
    propB?: number;
}

export function MyComponent({ propA, propB }: MyComponentProps) {
    return (...);
}
```

Pages use default export:
```tsx
export default function MyPage() { ... }
```

### Styling

- Use **Tailwind CSS v4** utility classes exclusively. No custom CSS files except `globals.css`.
- Use the `cn()` helper from `@/lib/utils` for all conditional class logic:
  ```ts
  import { cn } from '@/lib/utils';
  cn('base-class', condition && 'conditional-class')
  ```
- Standard portal page container:
  ```tsx
  <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
  ```

---

## Data Fetching Patterns

### SWR (for reads)

All data fetching uses **SWR** (`swr`). Keys are always arrays. Pass `null` as key when data is not ready to prevent premature fetching.

```tsx
const { data, isLoading, mutate } = useSWR(
    user?.id ? ['volunteer-tasks', user.id, statusFilter] : null,
    () => volunteersApi.getVolunteerTasks(user!.id, { status: statusFilter })
);
```

### Mutations (for writes)

Direct async calls wrapped in try/catch with `toast` feedback:

```ts
try {
    await tasksApi.updateTask(taskId, { status: newStatus });
    toast.success(t('statusUpdate.success'));
    mutate(); // revalidate SWR cache
} catch (error) {
    toast.error(t('statusUpdate.error'));
    console.error('Failed to update task status:', error);
}
```

### API Modules

Each domain has a module in `lib/api/[domain].ts` exporting a plain object of async methods using `apiClient`:

```ts
export const myFeatureApi = {
    getItems: (params?) => apiClient.get<Item[]>('/items/', params),
    getItem: (id: number) => apiClient.get<Item>(`/items/${id}`),
    createItem: (data: ItemCreate) => apiClient.post<Item>('/items/', data),
    updateItem: (id: number, data: ItemUpdate) => apiClient.patch<Item>(`/items/${id}`, data),
};
```

Export the new module from `lib/api/index.ts`.

**Base URL:** `NEXT_PUBLIC_API_URL` env var, defaults to `http://localhost:8000`.

---

## UI Patterns

### Loading State

Use the `Skeleton` component pattern:

```tsx
if (isLoading) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Skeleton className="h-8 w-64" />
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
            ))}
        </div>
    );
}
```

### Empty State

Use the `Empty` component system:

```tsx
<Empty>
    <EmptyHeader>
        <EmptyTitle>{t('noItems')}</EmptyTitle>
        <EmptyDescription>{t('noItemsDesc')}</EmptyDescription>
    </EmptyHeader>
</Empty>
```

### Page Layout

All portal pages use `PageHeader` from `@/components/shared`:

```tsx
<div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
    <PageHeader title={t('title')} description={t('subtitle')} actions={<Button>...</Button>} />
    {/* content */}
</div>
```

### Dialogs / Forms

Use controlled `open` state + `onSuccess` callback calling `mutate()`:

```tsx
const [isOpen, setIsOpen] = useState(false);
const [selected, setSelected] = useState<T | null>(null);
// ...
<MyFormDialog open={isOpen} onOpenChange={setIsOpen} item={selected} onSuccess={() => mutate()} />
```

---

## Internationalization (i18n)

- All user-facing strings use `next-intl` `useTranslations`. **No hardcoded UI strings.**
- Namespaces follow the UI hierarchy: `Volunteer.myTasks.filters.all`.
- Both `messages/en.json` and `messages/pt.json` must be updated together.
- Default locale is `pt`; supported locales: `en`, `pt`.

```tsx
const t = useTranslations('Volunteer.myTasks');
// usage: t('title'), t('filters.status')
```

---

## Role-Based Access

Known roles: `'admin'`, `'project_manager'`, `'staff_member'`, `'volunteer'`.

Sidebar nav items use a `roles` array to control visibility:
```ts
{ title: ..., href: ..., icon: ..., roles: ['admin', 'project_manager'] }
// omit roles field = visible to all roles
```

Access current user via `useAuth()`:
```tsx
const { user } = useAuth();
// user.user_type === 'volunteer'
```

Dashboard pages switch on `user?.user_type` to render role-specific components.

---

## State Management

- **Auth state:** `AuthContext` via `useAuth()` hook — provides `user`, `login`, `logout`, `isAuthenticated`
- **Loading overlay:** `LoadingContext` via `useLoading()` hook
- **Server data:** SWR — cached, auto-revalidated
- **Local UI state:** `useState` within components
- **No Redux, Zustand, or other global state library**

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `next` ^15 | Framework (App Router) |
| `react` ^19 | UI library |
| `next-intl` ^4 | i18n |
| `swr` ^2 | Data fetching / caching |
| `zod` ^4 | Schema validation |
| `sonner` ^2 | Toast notifications |
| `tailwindcss` ^4 | Styling |
| `@tanstack/react-table` ^8 | Data tables |
| `recharts` 2.x | Charts |
| `lucide-react` | Icons (primary) |
| `@tabler/icons-react` | Icons (secondary) |
| `date-fns` ^4 | Date formatting |
| `@radix-ui/*` | Accessible primitives (via shadcn) |
