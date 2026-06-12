# Hybrid Feature-Slice Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Next.js app from monolithic page files into a hybrid feature-slice architecture, moving 29 pages into feature domains while keeping all logic intact and all routes functioning identically.

**Architecture:** Pages become thin routing shells (5–10 lines) that import feature components. Logic moves into `src/features/*/components/` organized by domain (home, auth, courses, dashboard, etc.). Layout components move to `src/components/layout/`. All imports updated to use `@/` alias. Zero deletions, zero behavior changes.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind, shadcn/ui, Supabase

---

## Phase 1: Setup & Foundation

### Task 1: Create Feature Directory Structure

**Files:**
- Create: `src/features/home/components/`
- Create: `src/features/auth/components/`
- Create: `src/features/courses/components/`
- Create: `src/features/dashboard/components/`
- Create: `src/features/cart/components/`
- Create: `src/features/profile/components/`
- Create: `src/features/search/components/`
- Create: `src/features/support/components/`
- Create: `src/features/scholarships/components/`
- Create: `src/features/about/components/`
- Create: `src/features/legal/components/`
- Create: `src/components/layout/`
- Create: `src/hooks/`
- Create: `src/services/`
- Create: `src/types/`

- [ ] **Step 1: Create all feature directories at once**

```bash
cd "e:\nexttt\faireer academy\fairer-app"
mkdir -p src/features/home/components
mkdir -p src/features/auth/components
mkdir -p src/features/courses/components
mkdir -p src/features/dashboard/components
mkdir -p src/features/cart/components
mkdir -p src/features/profile/components
mkdir -p src/features/search/components
mkdir -p src/features/support/components
mkdir -p src/features/scholarships/components
mkdir -p src/features/about/components
mkdir -p src/features/legal/components
mkdir -p src/components/layout
mkdir -p src/hooks
mkdir -p src/services
mkdir -p src/types
```

- [ ] **Step 2: Verify directory structure**

```bash
ls -R src/features/ src/components/layout/ src/hooks/ src/services/ src/types/
```

Expected: All directories exist and are empty.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: create feature directory structure"
```

---

### Task 2: Move Layout Components to `src/components/layout/`

**Files:**
- Move: `src/components/Header.tsx` → `src/components/layout/Header.tsx`
- Move: `src/components/HeaderWrapper.tsx` → `src/components/layout/HeaderWrapper.tsx`
- Move: `src/components/ClientLayout.tsx` → `src/components/layout/ClientLayout.tsx`
- Keep: `src/components/ui/button.tsx` (unchanged)

- [ ] **Step 1: Read existing layout components to understand imports**

Read `src/components/Header.tsx`, `src/components/HeaderWrapper.tsx`, `src/components/ClientLayout.tsx` to identify all relative imports.

- [ ] **Step 2: Copy Header.tsx to new location**

```bash
cp "src/components/Header.tsx" "src/components/layout/Header.tsx"
```

- [ ] **Step 3: Copy HeaderWrapper.tsx to new location**

```bash
cp "src/components/HeaderWrapper.tsx" "src/components/layout/HeaderWrapper.tsx"
```

- [ ] **Step 4: Copy ClientLayout.tsx to new location**

```bash
cp "src/components/ClientLayout.tsx" "src/components/layout/ClientLayout.tsx"
```

- [ ] **Step 5: Delete originals from root components/**

```bash
rm "src/components/Header.tsx"
rm "src/components/HeaderWrapper.tsx"
rm "src/components/ClientLayout.tsx"
```

- [ ] **Step 6: Update imports in layout components**

In `src/components/layout/Header.tsx`, `src/components/layout/HeaderWrapper.tsx`, `src/components/layout/ClientLayout.tsx`:
- Change `from '@/context/` paths to use `@/context/`
- Change `from '@/components/ui/` to use `@/components/ui/`
- Change any relative imports to use `@/` alias

Example: `import { Button } from '../ui/button'` → `import { Button } from '@/components/ui/button'`

- [ ] **Step 7: Verify no other files import from old location yet**

```bash
grep -r "from.*components/Header" src/app/ src/features/ || echo "No imports found"
grep -r "from.*components/HeaderWrapper" src/app/ src/features/ || echo "No imports found"
grep -r "from.*components/ClientLayout" src/app/ src/features/ || echo "No imports found"
```

Expected: No matches (imports updated in Phase 2).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: move layout components to src/components/layout/"
```

---

## Phase 2: Move Page Logic into Features (29 Pages)

### Task 3: Move Home Page (691 lines)

**Files:**
- Move: `src/app/page.tsx` → `src/features/home/components/HomeView.tsx`
- Create: `src/app/page.tsx` (new shell)

- [ ] **Step 1: Read current app/page.tsx and copy content**

```bash
cat "src/app/page.tsx" > "/tmp/HomeView_content.tsx"
```

- [ ] **Step 2: Create HomeView.tsx with original content**

Create `src/features/home/components/HomeView.tsx` with the full content of the original `src/app/page.tsx` (691 lines). Do NOT modify the logic yet.

- [ ] **Step 3: Update imports in HomeView.tsx**

In `HomeView.tsx`, replace all import paths:
- `from '../../../components/Header'` → `from '@/components/layout/Header'`
- `from '../../../components/ClientLayout'` → `from '@/components/layout/ClientLayout'`
- `from '@/context/` → keep as-is (already uses @/ alias)
- `from '@/lib/` → keep as-is
- Any relative imports → convert to `@/` alias

- [ ] **Step 4: Create new app/page.tsx shell**

```tsx
import { HomeView } from '@/features/home/components/HomeView'

export default function Page() {
  return <HomeView />
}
```

- [ ] **Step 5: Verify no syntax errors**

```bash
cd "e:\nexttt\faireer academy\fairer-app" && npx tsc --noEmit src/features/home/components/HomeView.tsx src/app/page.tsx
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: move home page to features/home"
```

---

### Task 4: Move Auth Pages (4 pages: login, signup, forgot-password, reset-password)

**Files:**
- Move: `src/app/login/page.tsx` → `src/features/auth/components/LoginForm.tsx`
- Move: `src/app/signup/page.tsx` → `src/features/auth/components/SignupForm.tsx`
- Move: `src/app/forgot-password/page.tsx` → `src/features/auth/components/ForgotPasswordForm.tsx`
- Move: `src/app/reset-password/page.tsx` → `src/features/auth/components/ResetPasswordForm.tsx`
- Create: `src/app/login/page.tsx` (shell)
- Create: `src/app/signup/page.tsx` (shell)
- Create: `src/app/forgot-password/page.tsx` (shell)
- Create: `src/app/reset-password/page.tsx` (shell)

- [ ] **Step 1: Copy login/page.tsx → features/auth/components/LoginForm.tsx**

```bash
cp "src/app/login/page.tsx" "src/features/auth/components/LoginForm.tsx"
```

- [ ] **Step 2: Update imports in LoginForm.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 3: Create login page shell**

```tsx
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function Page() {
  return <LoginForm />
}
```

- [ ] **Step 4: Copy signup/page.tsx → features/auth/components/SignupForm.tsx**

```bash
cp "src/app/signup/page.tsx" "src/features/auth/components/SignupForm.tsx"
```

- [ ] **Step 5: Update imports in SignupForm.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 6: Create signup page shell**

```tsx
import { SignupForm } from '@/features/auth/components/SignupForm'

export default function Page() {
  return <SignupForm />
}
```

- [ ] **Step 7: Copy forgot-password/page.tsx → features/auth/components/ForgotPasswordForm.tsx**

```bash
cp "src/app/forgot-password/page.tsx" "src/features/auth/components/ForgotPasswordForm.tsx"
```

- [ ] **Step 8: Update imports in ForgotPasswordForm.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 9: Create forgot-password page shell**

```tsx
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export default function Page() {
  return <ForgotPasswordForm />
}
```

- [ ] **Step 10: Copy reset-password/page.tsx → features/auth/components/ResetPasswordForm.tsx**

```bash
cp "src/app/reset-password/page.tsx" "src/features/auth/components/ResetPasswordForm.tsx"
```

- [ ] **Step 11: Update imports in ResetPasswordForm.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 12: Create reset-password page shell**

```tsx
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export default function Page() {
  return <ResetPasswordForm />
}
```

- [ ] **Step 13: Verify no syntax errors**

```bash
npx tsc --noEmit src/features/auth/components/*.tsx src/app/login/page.tsx src/app/signup/page.tsx src/app/forgot-password/page.tsx src/app/reset-password/page.tsx
```

Expected: No errors.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: move auth pages to features/auth"
```

---

### Task 5: Move Course Pages (6 pages: browse, detail, create, lesson, edit, quiz)

**Files:**
- Move: `src/app/courses/page.tsx` → `src/features/courses/components/CoursesView.tsx`
- Move: `src/app/courses/create/page.tsx` → `src/features/courses/components/CourseCreateView.tsx`
- Move: `src/app/courses/lesson/page.tsx` → `src/features/courses/components/LessonView.tsx`
- Move: `src/app/courses/[id]/page.tsx` (stub) → `src/features/courses/components/CourseDetailView.tsx` (scaffold)
- Move: `src/app/courses/[id]/edit/page.tsx` (stub) → `src/features/courses/components/CourseEditView.tsx` (scaffold)
- Move: `src/app/courses/[id]/quiz/page.tsx` (stub) → `src/features/courses/components/QuizView.tsx` (scaffold)
- Create: all corresponding page shells

- [ ] **Step 1: Copy courses/page.tsx → features/courses/components/CoursesView.tsx**

```bash
cp "src/app/courses/page.tsx" "src/features/courses/components/CoursesView.tsx"
```

- [ ] **Step 2: Update imports in CoursesView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 3: Create courses page shell**

```tsx
import { CoursesView } from '@/features/courses/components/CoursesView'

export default function Page() {
  return <CoursesView />
}
```

- [ ] **Step 4: Copy courses/create/page.tsx → features/courses/components/CourseCreateView.tsx**

```bash
cp "src/app/courses/create/page.tsx" "src/features/courses/components/CourseCreateView.tsx"
```

- [ ] **Step 5: Update imports in CourseCreateView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 6: Create courses/create page shell**

```tsx
import { CourseCreateView } from '@/features/courses/components/CourseCreateView'

export default function Page() {
  return <CourseCreateView />
}
```

- [ ] **Step 7: Copy courses/lesson/page.tsx → features/courses/components/LessonView.tsx**

```bash
cp "src/app/courses/lesson/page.tsx" "src/features/courses/components/LessonView.tsx"
```

- [ ] **Step 8: Update imports in LessonView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 9: Create courses/lesson page shell**

```tsx
import { LessonView } from '@/features/courses/components/LessonView'

export default function Page() {
  return <LessonView />
}
```

- [ ] **Step 10: Create courses/[id]/components/CourseDetailView.tsx (scaffold)**

Create empty stub (will be filled later):

```tsx
'use client'

export interface CourseDetailViewProps {
  params: Promise<{ id: string }>
}

export function CourseDetailView({ params }: CourseDetailViewProps) {
  return <div>Course Detail View - Coming Soon</div>
}
```

- [ ] **Step 11: Create courses/[id]/page.tsx shell**

```tsx
import { CourseDetailView } from '@/features/courses/components/CourseDetailView'

export default function Page(props: { params: Promise<{ id: string }> }) {
  return <CourseDetailView params={props.params} />
}
```

- [ ] **Step 12: Create courses/[id]/edit/components/CourseEditView.tsx (scaffold)**

```tsx
'use client'

export interface CourseEditViewProps {
  params: Promise<{ id: string }>
}

export function CourseEditView({ params }: CourseEditViewProps) {
  return <div>Course Edit View - Coming Soon</div>
}
```

- [ ] **Step 13: Create courses/[id]/edit/page.tsx shell**

```tsx
import { CourseEditView } from '@/features/courses/components/CourseEditView'

export default function Page(props: { params: Promise<{ id: string }> }) {
  return <CourseEditView params={props.params} />
}
```

- [ ] **Step 14: Create courses/[id]/quiz/components/QuizView.tsx (scaffold)**

```tsx
'use client'

export interface QuizViewProps {
  params: Promise<{ id: string }>
}

export function QuizView({ params }: QuizViewProps) {
  return <div>Quiz View - Coming Soon</div>
}
```

- [ ] **Step 15: Create courses/[id]/quiz/page.tsx shell**

```tsx
import { QuizView } from '@/features/courses/components/QuizView'

export default function Page(props: { params: Promise<{ id: string }> }) {
  return <QuizView params={props.params} />
}
```

- [ ] **Step 16: Verify no syntax errors**

```bash
npx tsc --noEmit src/features/courses/components/*.tsx src/app/courses/**/*.tsx
```

Expected: No errors.

- [ ] **Step 17: Commit**

```bash
git add -A
git commit -m "feat: move course pages to features/courses"
```

---

### Task 6: Move Dashboard Pages (5 pages: student, admin, instructor, notifications, orders)

**Files:**
- Move: `src/app/dashboard/page.tsx` → `src/features/dashboard/components/StudentDashboard.tsx`
- Move: `src/app/dashboard/admin/page.tsx` → `src/features/dashboard/components/AdminDashboard.tsx`
- Move: `src/app/dashboard/instructor/page.tsx` → `src/features/dashboard/components/InstructorDashboard.tsx`
- Move: `src/app/dashboard/notifications/page.tsx` → `src/features/dashboard/components/NotificationsView.tsx`
- Move: `src/app/dashboard/orders/page.tsx` → `src/features/dashboard/components/OrdersView.tsx`
- Create: all corresponding page shells

- [ ] **Step 1: Copy dashboard/page.tsx → features/dashboard/components/StudentDashboard.tsx**

```bash
cp "src/app/dashboard/page.tsx" "src/features/dashboard/components/StudentDashboard.tsx"
```

- [ ] **Step 2: Update imports in StudentDashboard.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 3: Create dashboard page shell**

```tsx
import { StudentDashboard } from '@/features/dashboard/components/StudentDashboard'

export default function Page() {
  return <StudentDashboard />
}
```

- [ ] **Step 4: Copy dashboard/admin/page.tsx → features/dashboard/components/AdminDashboard.tsx**

```bash
cp "src/app/dashboard/admin/page.tsx" "src/features/dashboard/components/AdminDashboard.tsx"
```

- [ ] **Step 5: Update imports in AdminDashboard.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 6: Create dashboard/admin page shell**

```tsx
import { AdminDashboard } from '@/features/dashboard/components/AdminDashboard'

export default function Page() {
  return <AdminDashboard />
}
```

- [ ] **Step 7: Copy dashboard/instructor/page.tsx → features/dashboard/components/InstructorDashboard.tsx**

```bash
cp "src/app/dashboard/instructor/page.tsx" "src/features/dashboard/components/InstructorDashboard.tsx"
```

- [ ] **Step 8: Update imports in InstructorDashboard.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 9: Create dashboard/instructor page shell**

```tsx
import { InstructorDashboard } from '@/features/dashboard/components/InstructorDashboard'

export default function Page() {
  return <InstructorDashboard />
}
```

- [ ] **Step 10: Copy dashboard/notifications/page.tsx → features/dashboard/components/NotificationsView.tsx**

```bash
cp "src/app/dashboard/notifications/page.tsx" "src/features/dashboard/components/NotificationsView.tsx"
```

- [ ] **Step 11: Update imports in NotificationsView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 12: Create dashboard/notifications page shell**

```tsx
import { NotificationsView } from '@/features/dashboard/components/NotificationsView'

export default function Page() {
  return <NotificationsView />
}
```

- [ ] **Step 13: Copy dashboard/orders/page.tsx → features/dashboard/components/OrdersView.tsx**

```bash
cp "src/app/dashboard/orders/page.tsx" "src/features/dashboard/components/OrdersView.tsx"
```

- [ ] **Step 14: Update imports in OrdersView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 15: Create dashboard/orders page shell**

```tsx
import { OrdersView } from '@/features/dashboard/components/OrdersView'

export default function Page() {
  return <OrdersView />
}
```

- [ ] **Step 16: Verify no syntax errors**

```bash
npx tsc --noEmit src/features/dashboard/components/*.tsx src/app/dashboard/**/*.tsx
```

Expected: No errors.

- [ ] **Step 17: Commit**

```bash
git add -A
git commit -m "feat: move dashboard pages to features/dashboard"
```

---

### Task 7: Move Cart & Checkout Pages (2 pages)

**Files:**
- Move: `src/app/cart/page.tsx` → `src/features/cart/components/CartView.tsx`
- Move: `src/app/checkout/page.tsx` → `src/features/cart/components/CheckoutView.tsx`
- Create: all page shells

- [ ] **Step 1: Copy cart/page.tsx → features/cart/components/CartView.tsx**

```bash
cp "src/app/cart/page.tsx" "src/features/cart/components/CartView.tsx"
```

- [ ] **Step 2: Update imports in CartView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 3: Create cart page shell**

```tsx
import { CartView } from '@/features/cart/components/CartView'

export default function Page() {
  return <CartView />
}
```

- [ ] **Step 4: Copy checkout/page.tsx → features/cart/components/CheckoutView.tsx**

```bash
cp "src/app/checkout/page.tsx" "src/features/cart/components/CheckoutView.tsx"
```

- [ ] **Step 5: Update imports in CheckoutView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 6: Create checkout page shell**

```tsx
import { CheckoutView } from '@/features/cart/components/CheckoutView'

export default function Page() {
  return <CheckoutView />
}
```

- [ ] **Step 7: Verify no syntax errors**

```bash
npx tsc --noEmit src/features/cart/components/*.tsx src/app/cart/page.tsx src/app/checkout/page.tsx
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: move cart and checkout pages to features/cart"
```

---

### Task 8: Move Profile Pages (4 pages: profile, settings, certificates, [username])

**Files:**
- Move: `src/app/profile/page.tsx` → `src/features/profile/components/ProfileView.tsx`
- Move: `src/app/settings/page.tsx` → `src/features/profile/components/SettingsView.tsx`
- Move: `src/app/certificates/page.tsx` → `src/features/profile/components/CertificatesView.tsx`
- Create: `src/app/[username]/page.tsx` (scaffold)
- Create: all page shells

- [ ] **Step 1: Copy profile/page.tsx → features/profile/components/ProfileView.tsx**

```bash
cp "src/app/profile/page.tsx" "src/features/profile/components/ProfileView.tsx"
```

- [ ] **Step 2: Update imports in ProfileView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 3: Create profile page shell**

```tsx
import { ProfileView } from '@/features/profile/components/ProfileView'

export default function Page() {
  return <ProfileView />
}
```

- [ ] **Step 4: Copy settings/page.tsx → features/profile/components/SettingsView.tsx**

```bash
cp "src/app/settings/page.tsx" "src/features/profile/components/SettingsView.tsx"
```

- [ ] **Step 5: Update imports in SettingsView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 6: Create settings page shell**

```tsx
import { SettingsView } from '@/features/profile/components/SettingsView'

export default function Page() {
  return <SettingsView />
}
```

- [ ] **Step 7: Copy certificates/page.tsx → features/profile/components/CertificatesView.tsx**

```bash
cp "src/app/certificates/page.tsx" "src/features/profile/components/CertificatesView.tsx"
```

- [ ] **Step 8: Update imports in CertificatesView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 9: Create certificates page shell**

```tsx
import { CertificatesView } from '@/features/profile/components/CertificatesView'

export default function Page() {
  return <CertificatesView />
}
```

- [ ] **Step 10: Create [username] scaffold**

Create `src/features/profile/components/UserPublicProfile.tsx`:

```tsx
'use client'

export interface UserPublicProfileProps {
  params: Promise<{ username: string }>
}

export function UserPublicProfile({ params }: UserPublicProfileProps) {
  return <div>User Profile - Coming Soon</div>
}
```

- [ ] **Step 11: Create [username]/page.tsx shell**

```tsx
import { UserPublicProfile } from '@/features/profile/components/UserPublicProfile'

export default function Page(props: { params: Promise<{ username: string }> }) {
  return <UserPublicProfile params={props.params} />
}
```

- [ ] **Step 12: Verify no syntax errors**

```bash
npx tsc --noEmit src/features/profile/components/*.tsx src/app/profile/page.tsx src/app/settings/page.tsx src/app/certificates/page.tsx src/app/\[username\]/page.tsx
```

Expected: No errors.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: move profile pages to features/profile"
```

---

### Task 9: Move Search & Support Pages (6 pages: search, support, chat, contact, community, community/[id])

**Files:**
- Move: `src/app/search/page.tsx` → `src/features/search/components/SearchView.tsx`
- Move: `src/app/support/page.tsx` → `src/features/support/components/SupportView.tsx`
- Move: `src/app/support/chat/page.tsx` → `src/features/support/components/ChatView.tsx`
- Move: `src/app/support/contact/page.tsx` → `src/features/support/components/ContactView.tsx`
- Move: `src/app/support/community/page.tsx` → `src/features/support/components/CommunityView.tsx`
- Create: `src/app/support/community/[id]/page.tsx` (scaffold)
- Create: all page shells

- [ ] **Step 1: Copy search/page.tsx → features/search/components/SearchView.tsx**

```bash
cp "src/app/search/page.tsx" "src/features/search/components/SearchView.tsx"
```

- [ ] **Step 2: Update imports in SearchView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 3: Create search page shell**

```tsx
import { SearchView } from '@/features/search/components/SearchView'

export default function Page() {
  return <SearchView />
}
```

- [ ] **Step 4: Copy support/page.tsx → features/support/components/SupportView.tsx**

```bash
cp "src/app/support/page.tsx" "src/features/support/components/SupportView.tsx"
```

- [ ] **Step 5: Update imports in SupportView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 6: Create support page shell**

```tsx
import { SupportView } from '@/features/support/components/SupportView'

export default function Page() {
  return <SupportView />
}
```

- [ ] **Step 7: Copy support/chat/page.tsx → features/support/components/ChatView.tsx**

```bash
cp "src/app/support/chat/page.tsx" "src/features/support/components/ChatView.tsx"
```

- [ ] **Step 8: Update imports in ChatView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 9: Create support/chat page shell**

```tsx
import { ChatView } from '@/features/support/components/ChatView'

export default function Page() {
  return <ChatView />
}
```

- [ ] **Step 10: Copy support/contact/page.tsx → features/support/components/ContactView.tsx**

```bash
cp "src/app/support/contact/page.tsx" "src/features/support/components/ContactView.tsx"
```

- [ ] **Step 11: Update imports in ContactView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 12: Create support/contact page shell**

```tsx
import { ContactView } from '@/features/support/components/ContactView'

export default function Page() {
  return <ContactView />
}
```

- [ ] **Step 13: Copy support/community/page.tsx → features/support/components/CommunityView.tsx**

```bash
cp "src/app/support/community/page.tsx" "src/features/support/components/CommunityView.tsx"
```

- [ ] **Step 14: Update imports in CommunityView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 15: Create support/community page shell**

```tsx
import { CommunityView } from '@/features/support/components/CommunityView'

export default function Page() {
  return <CommunityView />
}
```

- [ ] **Step 16: Create community/[id] scaffold**

Create `src/features/support/components/CommunityPostView.tsx`:

```tsx
'use client'

export interface CommunityPostViewProps {
  params: Promise<{ id: string }>
}

export function CommunityPostView({ params }: CommunityPostViewProps) {
  return <div>Community Post - Coming Soon</div>
}
```

- [ ] **Step 17: Create support/community/[id]/page.tsx shell**

```tsx
import { CommunityPostView } from '@/features/support/components/CommunityPostView'

export default function Page(props: { params: Promise<{ id: string }> }) {
  return <CommunityPostView params={props.params} />
}
```

- [ ] **Step 18: Verify no syntax errors**

```bash
npx tsc --noEmit src/features/search/components/*.tsx src/features/support/components/*.tsx src/app/search/page.tsx src/app/support/**/*.tsx
```

Expected: No errors.

- [ ] **Step 19: Commit**

```bash
git add -A
git commit -m "feat: move search and support pages to features/"
```

---

### Task 10: Move Remaining Pages (4 pages: scholarships, bidjobs, about, privacy/terms)

**Files:**
- Move: `src/app/scholarships/page.tsx` → `src/features/scholarships/components/ScholarshipsView.tsx`
- Move: `src/app/bidjobs/page.tsx` → `src/features/scholarships/components/BidjobsView.tsx`
- Move: `src/app/about/page.tsx` → `src/features/about/components/AboutView.tsx`
- Move: `src/app/privacy/page.tsx` → `src/features/legal/components/PrivacyView.tsx`
- Move: `src/app/terms/page.tsx` → `src/features/legal/components/TermsView.tsx`
- Create: all page shells

- [ ] **Step 1: Copy scholarships/page.tsx → features/scholarships/components/ScholarshipsView.tsx**

```bash
cp "src/app/scholarships/page.tsx" "src/features/scholarships/components/ScholarshipsView.tsx"
```

- [ ] **Step 2: Update imports in ScholarshipsView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 3: Create scholarships page shell**

```tsx
import { ScholarshipsView } from '@/features/scholarships/components/ScholarshipsView'

export default function Page() {
  return <ScholarshipsView />
}
```

- [ ] **Step 4: Copy bidjobs/page.tsx → features/scholarships/components/BidjobsView.tsx**

```bash
cp "src/app/bidjobs/page.tsx" "src/features/scholarships/components/BidjobsView.tsx"
```

- [ ] **Step 5: Update imports in BidjobsView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 6: Create bidjobs page shell**

```tsx
import { BidjobsView } from '@/features/scholarships/components/BidjobsView'

export default function Page() {
  return <BidjobsView />
}
```

- [ ] **Step 7: Copy about/page.tsx → features/about/components/AboutView.tsx**

```bash
cp "src/app/about/page.tsx" "src/features/about/components/AboutView.tsx"
```

- [ ] **Step 8: Update imports in AboutView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 9: Create about page shell**

```tsx
import { AboutView } from '@/features/about/components/AboutView'

export default function Page() {
  return <AboutView />
}
```

- [ ] **Step 10: Copy privacy/page.tsx → features/legal/components/PrivacyView.tsx**

```bash
cp "src/app/privacy/page.tsx" "src/features/legal/components/PrivacyView.tsx"
```

- [ ] **Step 11: Update imports in PrivacyView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 12: Create privacy page shell**

```tsx
import { PrivacyView } from '@/features/legal/components/PrivacyView'

export default function Page() {
  return <PrivacyView />
}
```

- [ ] **Step 13: Copy terms/page.tsx → features/legal/components/TermsView.tsx**

```bash
cp "src/app/terms/page.tsx" "src/features/legal/components/TermsView.tsx"
```

- [ ] **Step 14: Update imports in TermsView.tsx**

Replace relative imports with `@/` alias.

- [ ] **Step 15: Create terms page shell**

```tsx
import { TermsView } from '@/features/legal/components/TermsView'

export default function Page() {
  return <TermsView />
}
```

- [ ] **Step 16: Verify no syntax errors**

```bash
npx tsc --noEmit src/features/scholarships/components/*.tsx src/features/about/components/*.tsx src/features/legal/components/*.tsx src/app/scholarships/page.tsx src/app/bidjobs/page.tsx src/app/about/page.tsx src/app/privacy/page.tsx src/app/terms/page.tsx
```

Expected: No errors.

- [ ] **Step 17: Commit**

```bash
git add -A
git commit -m "feat: move remaining pages to features/"
```

---

## Phase 3: Verification & Build

### Task 11: Full TypeScript Check & Build

**Files:**
- Check: All moved files
- Build: `npm run build`

- [ ] **Step 1: Run full TypeScript type check**

```bash
cd "e:\nexttt\faireer academy\fairer-app" && npx tsc --noEmit
```

Expected: No errors (may have warnings, but no critical errors).

- [ ] **Step 2: If TypeScript errors found, diagnose and fix**

Common issues:
- Missing imports in moved files
- Import paths using old locations
- Context/lib imports not updated

Fix each error by updating the file path or import statement.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build completes successfully with no errors. Build time should be similar to before.

- [ ] **Step 4: Check for build errors**

If build fails, look for:
- Module resolution errors
- Missing dependencies
- Import cycles

Debug and fix. Re-run `npm run build` until it passes.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: pass TypeScript check and build"
```

---

### Task 12: Spot-Check Routes

**Files:**
- Test: Key routes in browser

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Wait for server to start (usually 10–20 seconds).

- [ ] **Step 2: Test home page**

Navigate to `http://localhost:3000`

Expected: Page loads, looks identical to before, no console errors.

- [ ] **Step 3: Test login page**

Navigate to `http://localhost:3000/login`

Expected: Page loads, looks identical to before, no console errors.

- [ ] **Step 4: Test dashboard**

Navigate to `http://localhost:3000/dashboard`

Expected: Page loads, looks identical to before, no console errors.

- [ ] **Step 5: Test courses page**

Navigate to `http://localhost:3000/courses`

Expected: Page loads, looks identical to before, no console errors.

- [ ] **Step 6: Test about page**

Navigate to `http://localhost:3000/about`

Expected: Page loads, looks identical to before, no console errors.

- [ ] **Step 7: Check browser console for errors**

Expected: No red errors, no unresolved import warnings.

- [ ] **Step 8: Stop dev server**

Press `Ctrl+C` in terminal.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "test: verify routes load identically"
```

---

### Task 13: Final Cleanup & Documentation

**Files:**
- Delete: Old empty feature directories (if created during testing)
- Update: Any comments or docs referencing old paths

- [ ] **Step 1: Verify old component files are deleted**

```bash
ls -la "src/components/*.tsx" 2>/dev/null | grep -v layout | grep -v ui
```

Expected: Only `ui/` and `layout/` subdirectories, no .tsx files in root.

- [ ] **Step 2: Verify no orphaned files**

```bash
find "src/app" -type f -name "*.tsx" -exec sh -c 'wc -l "$1" | grep -E "^[[:space:]]*[0-9]{1,2}[[:space:]]"' _ {} \;
```

Expected: All `page.tsx` files are 5–15 lines (thin shells).

- [ ] **Step 3: Create a quick reference doc** (optional)

Create `docs/ARCHITECTURE.md` with a summary of the new structure and how to add new features.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "docs: architecture restructure complete"
```

---

## Success Metrics

After completing all tasks:

✅ All existing pages render identically (zero behavior changes)
✅ Build completes with no errors
✅ All imports resolve (no "module not found" errors)
✅ File structure matches the spec
✅ All `app/**/*.tsx` files are 5–15 lines (shells only)
✅ Zero deletions — all original logic is preserved
✅ Empty dynamic routes have thin shells ready for future implementation
✅ TypeScript type-check passes
✅ All routes load in browser without console errors

---

## Rollback Plan

If anything breaks during implementation:

```bash
git log --oneline | head -20  # See all commits
git reset --hard <commit-hash>  # Revert to any earlier commit
```

Each task commits independently, so you can roll back specific tasks without losing earlier work.
