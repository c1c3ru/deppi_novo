# Implementation Plan - Vitrine Tecnológica Completion

This plan focuses on fixing the current UI issues in the Laboratory Showcase feature and ensuring it meets the design requirements.

## Phase 1: Fix Current Problems (Aesthetics & Accessibility)
- [ ] **Fix `lab-form.component.html`**
    - Remove inline styles and move them to `lab-form.component.scss`.
    - Add missing labels and placeholders for all form inputs.
    - Ensure accessibility (ARIA, etc.).
- [ ] **Fix `lab-detail.component.html`**
    - Remove inline styles and move them to `lab-detail.component.scss`.
    - Improve layout for "Produções" and "Serviços" sections.
- [ ] **Fix `lab-list.component.html`**
    - Remove inline styles and move them to `lab-list.component.scss`.
    - Ensure cards follow the `glass-card` pattern from `main.scss`.

## Phase 2: Refine Component Logic
- [ ] **Review `lab-form.component.ts`**
    - Implement FormArray logic correctly for Productions and Services.
    - Handle loading and saving states with feedback (toasts/spinners).
- [ ] **Review `lab-detail.component.ts`**
    - Ensure it fetches the lab by ID correctly.
    - Implement "Delete" functionality (with confirmation).
- [ ] **Review `lab-list.component.ts`**
    - Implement admin-only "Add" and "Edit" buttons using `AuthService`.

## Phase 3: Backend Refinement & Initial Data
- [ ] **Review `laboratorios.controller.ts`**
    - Ensure JSON parsing is handled correctly for Postgres (if needed).
    - Tighten up error handling.
- [ ] **Create Seed Data**
    - Create a seed file for the 6 initial laboratories (LINC, LabVICIA, LAESE, LIT, LAPEQ, LIMAV).

## Phase 4: Final Polishing
- [ ] **Add Transitions/Animations**
    - Add `reveal-up` or other micro-animations to lab cards and details.
- [ ] **Verify Responsiveness**
    - Ensure the grid and forms look great on mobile.
- [ ] **Run Quality Audit**
    - Check for any remaining linting issues or console errors.
