# Glass Effect System Design

## 1. Overview

This document outlines the design for a comprehensive glass effect system integrated into the `a1-components` library. The goal is to provide a consistent, theme-aware glass morphism look for Buttons, Text Fields, Number Fields, and Dialogs.

## 2. Requirements Review

*   **Light Theme:** `bg-white/40`, `backdrop-blur-md`, `border-primary/20`, `text-on-primary-container`.
*   **Dark Theme:** `bg-white/10`, `backdrop-blur-md`, `border-white/20`, `text-white`.
*   **Dialog Specific:** "Backdrop should be totally transparent" (Overlay).

## 3. Architecture

### 3.1 CSS Strategy

We will move away from hardcoded utility classes in components and establish a set of standard utility classes in `src/index.css` (or potentially `tailwind.config.mjs` as plugins, but CSS is simpler for now). This ensures consistency and easier maintenance.

**Proposed CSS Classes (in `src/index.css`):**

```css
@layer components {
  /* Base Glass Container */
  .glass-base {
    @apply backdrop-blur-md transition-all duration-200;
  }

  /* Theme-specific variants */
  :root[data-theme="light"] .glass-base {
    @apply bg-white/40 border border-primary/20 text-on-primary-container;
  }
  
  :root[data-theme="dark"] .glass-base,
  .dark .glass-base {
    @apply bg-white/10 border border-white/20 text-white;
  }

  /* Interactive States (Hover/Focus) */
  .glass-interactive:hover {
    @apply bg-white/50; /* Light mode hover */
  }
  
  :root[data-theme="dark"] .glass-interactive:hover,
  .dark .glass-interactive:hover {
    @apply bg-white/20; /* Dark mode hover */
  }

  /* Focus rings for glass elements */
  .glass-focus {
    @apply focus:ring-2 focus:ring-primary/50 focus:outline-none;
  }
}
```

*Note: The existing `.glass-effect` class in `src/index.css` will be refactored or replaced by this new system.*

### 3.2 Component Updates

All components will implement a consistent `asGlass(enabled: boolean = true)` method in their builders.

#### **Button (`ButtonBuilder`)**
*   **Current:** Has partial glass implementation with hardcoded values.
*   **New:**
    *   Refactor `build()` to use `.glass-base`, `.glass-interactive`, and `.glass-focus`.
    *   Handle `ButtonStyle.TEXT` specifically (might not need background, just glass text color?). *Decision: Glass text buttons probably just need the text color adaptation, not the background/border.*
    *   Ensure proper text color overrides (Theme `on-primary-container` vs `white`).

#### **TextField (`TextFieldBuilder`)**
*   **Current:** Hardcoded `bg-white/20` etc.
*   **New:**
    *   Apply `.glass-base` to the input wrapper.
    *   Apply `.glass-focus` to the input wrapper (using `focus-within`).
    *   **Label & Icons:** Ensure they inherit the correct color (`text-on-primary-container` / `text-white`).
    *   Remove default backgrounds (`bg-surface-variant`, etc.) when in glass mode.

#### **NumberField (`NumberFieldBuilder`)**
*   **Current:** Similar to TextField.
*   **New:**
    *   Apply `.glass-base` to the input wrapper.
    *   Apply `.glass-focus` to the input wrapper (using `focus-within`).
    *   Handle prefix/suffix/label colors to match the glass theme.

#### **Dialog (`DialogBuilder`)**
*   **Current:** Uses `backdrop:bg-white/50` which is the overlay. The dialog itself has `glass-effect`.
*   **New:**
    *   **Dialog Background:** Apply `.glass-base` to the `dialog` element itself.
    *   **Backdrop (Overlay):** Requirement says "totally transparent".
        *   We will set `backdrop:bg-transparent` (or `backdrop:opacity-0`) when `asGlass()` is active.
    *   **Header/Content/Toolbar:** ensure text colors are correct.

## 4. Implementation Steps

1.  **Update `src/index.css`:** Define the `.glass-base`, `.glass-interactive` classes.
2.  **Refactor `ButtonBuilder`:** Remove hardcoded glass classes, use new CSS classes.
3.  **Refactor `TextFieldBuilder`:** Use new CSS classes, clean up color logic.
4.  **Refactor `NumberFieldBuilder`:** Use new CSS classes, clean up color logic.
5.  **Refactor `DialogBuilder`:** Implement transparent backdrop and use new glass classes.
6.  **Verification:** Check Storybook or create a test page to verify Light vs Dark mode appearance.

## 5. Questions/Refinements

*   *Validation:* Do we want `bg-white/40` for light mode? It might be too opaque if the background is complex. *Assumption: Sticking to requirements `bg-white/40`.*
*   *Borders:* `border-primary/20` (Light) vs `border-white/20` (Dark).
*   *Text:* `text-on-primary-container` (Light) vs `text-white` (Dark).

