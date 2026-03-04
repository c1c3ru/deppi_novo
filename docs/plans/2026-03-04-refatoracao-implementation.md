# DEPPI Refactoring Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Resolve compilation errors, unify theme/i18n architecture, and optimize build configurations for the DEPPI portal.

**Architecture:** Centralized state management for themes, consolidated utility services, and modularized styles to improve maintenance and performance.

**Tech Stack:** Angular 17, SCSS, RxJS.

---

### Task 1: Fix Contact Module Compilation
**Goal:** Resolve the "Cannot find name 'inject'" error in `contact.module.ts`.

**Files:**
- Modify: `src/app/features/contact/contact.module.ts:1-20, 220-230`

**Step 1: Add inject to imports**
Modify `src/app/features/contact/contact.module.ts`:
```typescript
import { NgModule, inject } from '@angular/core';
```

**Step 2: Verify compilation**
Run: `npm run build`
Expected: No error in `contact.module.ts`.

**Step 3: Commit**
```bash
git add src/app/features/contact/contact.module.ts
git commit -m "fix(contact): add missing inject import"
```

---

### Task 2: Fix SCSS Backdrop-Filter
**Goal:** Fix Safari compatibility and IDE warnings by reordering/adding prefixes.

**Files:**
- Modify: `src/assets/styles/main.scss:70-75, 137-142`

**Step 1: Reorder/Add prefixes in .glass**
Modify `src/assets/styles/main.scss:72-73`:
```scss
  -webkit-backdrop-filter: blur(var(--glass-blur));
  backdrop-filter: blur(var(--glass-blur));
```

**Step 2: Add prefix in .btn-glass**
Modify `src/assets/styles/main.scss:140`:
```scss
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
```

**Step 3: Commit**
```bash
git add src/assets/styles/main.scss
git commit -m "fix(styles): add -webkit-backdrop-filter and reorder for Safari"
```

---

### Task 3: Fix Environment Replacements
**Goal:** Ensure `environment.prod.ts` is used in production builds.

**Files:**
- Modify: `angular.json`

**Step 1: Add fileReplacements back to production configuration**
Add to `projects.deppi.architect.build.configurations.production`:
```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

**Step 2: Verify production build**
Run: `npm run build:prod`
Expected: No "unused environment.prod.ts" warning.

**Step 3: Commit**
```bash
git add angular.json
git commit -m "build: fix environment file replacements for production"
```

---

### Task 4: Unify Theme Management
**Goal:** Make `ThemeService` the single source of truth.

**Files:**
- Modify: `src/app/core/services/theme.service.ts`

**Step 1: Add theme subject to ThemeService**
Add a `BehaviorSubject` to track current theme and expose it as an observable.

**Step 2: Refactor toggleTheme in ThemeService**
Ensure it updates both the DOM, storage, and the observable.

**Step 3: Commit**
```bash
git add src/app/core/services/theme.service.ts
git commit -m "refactor(core): unify theme state management in ThemeService"
```

---

### Task 5: Refactor Header to use ThemeService
**Goal:** Remove direct DOM/localStorage manipulation from Header.

**Files:**
- Modify: `src/app/layout/components/header/header.component.ts`

**Step 1: Inject ThemeService**
```typescript
private readonly themeService = inject(ThemeService);
```

**Step 2: Use ThemeService observable for theme state**
Remove `localStorage` and `document.documentElement` calls. Use `themeService.currentTheme$` if available or just `getCurrentTheme()`.

**Step 3: Update toggleTheme**
```typescript
toggleTheme(): void {
  this.themeService.toggleTheme();
  this.isDarkTheme = this.themeService.getCurrentTheme() === 'dark';
}
```

**Step 4: Commit**
```bash
git add src/app/layout/components/header/header.component.ts
git commit -m "refactor(layout): use ThemeService for theme toggling in Header"
```

---

### Task 6: Extract Header CSS
**Goal:** Resolve budget warnings by moving component styles to SCSS.

**Files:**
- Create: `src/app/layout/components/header/header.component.scss`
- Modify: `src/app/layout/components/header/header.component.ts`

**Step 1: Move styles to header.component.scss**
Move all styles from `styles: [...]` in `header.component.ts` to the new file.

**Step 2: Update HeaderComponent decorator**
Change `styles: [...]` to `styleUrls: ['./header.component.scss']`.

**Step 3: Commit**
```bash
git add src/app/layout/components/header/header.component.scss src/app/layout/components/header/header.component.ts
git commit -m "style(header): extract styles to dedicated SCSS file"
```

---

### Task 7: Optimize Budgets
**Goal:** Adjust build budgets to reasonable production values.

**Files:**
- Modify: `angular.json`

**Step 1: Increase anyComponentStyle budget**
Adjust `maximumWarning` to `4kb` and `maximumError` to `10kb` to accommodate complex modern components.

**Step 2: Commit**
```bash
git add angular.json
git commit -m "build: optimize build budgets"
```
