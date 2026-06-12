# Hybrid Feature-Slice Architecture Restructure

**Date:** 2026-06-12  
**Status:** Design  
**Scope:** File structure reorganization — zero deletions, zero behavior changes

---

## Problem Statement

Current codebase has monolithic page files that couple routing to all business logic:
- `app/page.tsx` — 691 lines (home + landing)
- `app/dashboard/admin/page.tsx` — 648 lines
- `app/courses/create/page.tsx` — 502 lines
- Zero component co-location (only 4 components total in `src/components/`)
- No dedicated services/hooks/types layers
- Hard to navigate, test, and extend

**Goal:** Reorganize into a hybrid feature-slice architecture where:
1. Each feature domain (courses, dashboard, auth, etc.) owns its components
2. Pages become thin routing shells (5–10 lines)
3. Logic and state live in `features/*/components/`
4. Shared concerns live in top-level `hooks/`, `services/`, `types/`
5. **No deletions, no behavior changes — purely structural**

---

## Architecture

### Directory Structure

```
src/
├── app/                          ← Next.js routing (thin shells only)
│   ├── layout.tsx
│   ├── page.tsx                  → imports HomeView
│   ├── not-found.tsx
│   ├── globals.css
│   ├── favicon.ico
│   ├── auth/
│   │   ├── callback/route.ts     (API route, unchanged)
│   │   ├── login/page.tsx        → imports LoginForm
│   │   ├── signup/page.tsx       → imports SignupForm
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── courses/
│   │   ├── page.tsx              → imports CoursesView
│   │   ├── create/page.tsx       → imports CourseCreateView
│   │   ├── lesson/page.tsx       → imports LessonView
│   │   └── [id]/
│   │       ├── page.tsx          → imports CourseDetailView
│   │       ├── edit/page.tsx     → imports CourseEditView
│   │       └── quiz/page.tsx     → imports QuizView
│   ├── dashboard/
│   │   ├── page.tsx              → imports StudentDashboard
│   │   ├── admin/page.tsx        → imports AdminDashboard
│   │   ├── instructor/page.tsx   → imports InstructorDashboard
│   │   ├── notifications/page.tsx → imports NotificationsView
│   │   └── orders/page.tsx       → imports OrdersView
│   ├── cart/page.tsx             → imports CartView
│   ├── checkout/page.tsx         → imports CheckoutView
│   ├── profile/page.tsx          → imports ProfileView
│   ├── settings/page.tsx         → imports SettingsView
│   ├── certificates/page.tsx     → imports CertificatesView
│   ├── search/page.tsx           → imports SearchView
│   ├── scholarships/page.tsx     → imports ScholarshipsView
│   ├── bidjobs/page.tsx          → imports BidjobsView
│   ├── support/
│   │   ├── page.tsx              → imports SupportView
│   │   ├── chat/page.tsx         → imports ChatView
│   │   ├── contact/page.tsx      → imports ContactView
│   │   └── community/
│   │       ├── page.tsx          → imports CommunityView
│   │       └── [id]/page.tsx     → imports CommunityPostView
│   ├── about/page.tsx            → imports AboutView
│   ├── privacy/page.tsx          → imports PrivacyView
│   ├── terms/page.tsx            → imports TermsView
│   └── [username]/page.tsx       → imports UserPublicProfile
│
├── features/                     ← Feature domains (all real logic)
│   ├── home/
│   │   └── components/
│   │       └── HomeView.tsx      (691 lines, moved from app/page.tsx)
│   ├── auth/
│   │   └── components/
│   │       ├── LoginForm.tsx
│   │       ├── SignupForm.tsx
│   │       ├── ForgotPasswordForm.tsx
│   │       └── ResetPasswordForm.tsx
│   ├── courses/
│   │   └── components/
│   │       ├── CoursesView.tsx
│   │       ├── CourseDetailView.tsx
│   │       ├── CourseCreateView.tsx
│   │       ├── LessonView.tsx
│   │       ├── CourseEditView.tsx
│   │       └── QuizView.tsx
│   ├── dashboard/
│   │   └── components/
│   │       ├── StudentDashboard.tsx
│   │       ├── AdminDashboard.tsx  (648 lines, moved from app/dashboard/admin)
│   │       ├── InstructorDashboard.tsx
│   │       ├── NotificationsView.tsx
│   │       └── OrdersView.tsx
│   ├── cart/
│   │   └── components/
│   │       ├── CartView.tsx
│   │       └── CheckoutView.tsx
│   ├── profile/
│   │   └── components/
│   │       ├── ProfileView.tsx
│   │       ├── SettingsView.tsx
│   │       ├── CertificatesView.tsx
│   │       └── UserPublicProfile.tsx
│   ├── search/
│   │   └── components/
│   │       └── SearchView.tsx
│   ├── support/
│   │   └── components/
│   │       ├── SupportView.tsx
│   │       ├── ChatView.tsx
│   │       ├── ContactView.tsx
│   │       ├── CommunityView.tsx
│   │       └── CommunityPostView.tsx
│   ├── scholarships/
│   │   └── components/
│   │       ├── ScholarshipsView.tsx
│   │       └── BidjobsView.tsx
│   ├── about/
│   │   └── components/
│   │       └── AboutView.tsx
│   ├── legal/
│   │   └── components/
│   │       ├── PrivacyView.tsx
│   │       └── TermsView.tsx
│   └── profile/users/
│       └── components/
│           └── UserPublicProfile.tsx
│
├── components/
│   ├── ui/                       ← shadcn primitives
│   │   └── button.tsx            (unchanged)
│   └── layout/                   ← moved from root components/
│       ├── Header.tsx
│       ├── HeaderWrapper.tsx
│       └── ClientLayout.tsx
│
├── hooks/                        ← Shared hooks (to add later)
│   └── (empty, ready for useAuth, useCart, etc.)
│
├── services/                     ← Supabase query functions (to add later)
│   └── (empty, ready for coursesService, usersService, etc.)
│
├── types/                        ← Shared TypeScript types (to add later)
│   └── (empty, ready for Course, User, etc.)
│
├── context/
│   ├── CartContext.tsx           (unchanged)
│   └── LanguageContext.tsx       (unchanged)
│
└── lib/
    ├── supabase.ts               (unchanged)
    ├── email.ts                  (unchanged)
    ├── utils.ts                  (unchanged)
    └── translations/
        ├── ar.ts                 (unchanged)
        └── en.ts                 (unchanged)
```

### Page Shell Pattern

Every page becomes a thin routing shell:

```tsx
// app/page.tsx (AFTER)
import { HomeView } from '@/features/home/components/HomeView'

export default function Page() {
  return <HomeView />
}
```

Original page logic moves **verbatim** into `HomeView.tsx` in `features/home/components/` — **zero code changes, zero deletions**.

### Import Updates

All imports within moved files are updated to use new paths:

**Before:** `app/page.tsx` imports `Header` from `../../../components/Header`
**After:** `features/home/components/HomeView.tsx` imports `Header` from `@/components/layout/Header`

Paths use `@/` alias (already configured in `tsconfig.json`).

### Empty Dynamic Routes

The five empty dynamic route pages get scaffolded with thin shells:
- `app/courses/[id]/page.tsx`
- `app/courses/[id]/edit/page.tsx`
- `app/courses/[id]/quiz/page.tsx`
- `app/support/community/[id]/page.tsx`
- `app/[username]/page.tsx`

Each becomes:
```tsx
import { ComponentName } from '@/features/domain/components/ComponentName'

export default function Page(props: { params: Promise<{ id: string }> }) {
  return <ComponentName params={props.params} />
}
```

No logic is written. When ready to implement, developers fill in the corresponding `ComponentName.tsx` file.

---

## Impact Matrix

| Item | Status | Notes |
|---|---|---|
| All page logic/state | Moved | Into `features/*/components/` |
| Page JSX | Moved | Into `features/*/components/` |
| API routes (`auth/callback`) | Unchanged | Left in place |
| Context providers | Unchanged | `CartContext`, `LanguageContext` |
| Supabase client | Unchanged | `lib/supabase.ts` |
| Utils, email, translations | Unchanged | `lib/` |
| shadcn UI primitives | Unchanged | `components/ui/` |
| Layout components | Moved | From `src/components/` to `src/components/layout/` |
| Middleware | Unchanged | `src/middleware.ts` |
| TypeScript config | Unchanged | `@/` alias already configured |
| Build output | Unchanged | No behavior changes |
| Deployed app | Unchanged | Only file structure, zero logic differences |

---

## Implementation Order

1. **Create feature directory structure** — all `src/features/*/components/` folders
2. **Move page files** — each page's JSX/logic into corresponding feature component
3. **Update imports** — all import paths in moved files to use `@/` alias
4. **Create page shells** — replace all `app/**/page.tsx` with 5-line shells
5. **Scaffold empty routes** — add thin shells to dynamic route pages
6. **Verify build** — `npm run build` passes with no errors
7. **Spot-check routes** — manually verify a few pages load identically

---

## Success Criteria

- [ ] All existing pages render identically (zero behavior changes)
- [ ] Build completes with no errors
- [ ] All imports resolve (no "module not found" errors)
- [ ] File structure matches the diagram above
- [ ] `app/**/*.tsx` files are all 5–15 lines (shells only)
- [ ] Zero deletions — all original logic is preserved
- [ ] Empty dynamic routes have thin shells ready for future implementation

---

## Future Opportunities (Out of Scope)

Once restructured, these become easier:
- Extract data-fetching into `src/services/` (e.g., `services/courses.ts`)
- Create shared hooks in `src/hooks/` (e.g., `useAuth`, `useCourses`)
- Define types in `src/types/` (e.g., `Course`, `User`)
- Add feature-specific tests alongside components
- Lazy-load feature routes with `dynamic()` for bundle optimization
