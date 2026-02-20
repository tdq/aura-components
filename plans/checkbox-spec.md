# Technical Specification: Checkbox Component

## 1. Component Structure (HTML/DOM Structure)

The Checkbox component will be implemented as a functional wrapper around a hidden native input, providing a custom-styled visual representation that follows Material Design 3 guidelines.

```html
<label class="inline-flex items-center gap-px-8 cursor-pointer group select-none">
  <!-- Container for the visual checkbox -->
  <div class="relative flex items-center justify-center w-px-18 h-px-18">
    <!-- Hidden native checkbox -->
    <input type="checkbox" class="sr-only peer" />
    
    <!-- Custom checkbox box -->
    <div class="w-full h-full border-2 rounded-small transition-all
                peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2
                peer-checked:bg-primary peer-checked:border-primary
                peer-disabled:opacity-38 peer-disabled:cursor-not-allowed
                border-outline">
      
      <!-- Checkmark Icon (visible only when checked) -->
      <svg class="absolute inset-0 w-full h-full text-on-primary scale-0 transition-transform peer-checked:scale-100" 
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4">
        <path d="M5 13l4 4L19 7" />
      </svg>
      
      <!-- Indeterminate State (optional/future) -->
      <div class="absolute inset-x-px-4 top-1/2 -translate-y-1/2 h-px-2 bg-on-primary scale-0 transition-transform peer-indeterminate:scale-100"></div>
    </div>
    
    <!-- State Layer (Hover/Pressed) -->
    <div class="absolute -inset-px-8 rounded-full bg-primary opacity-0 
                group-hover:opacity-[var(--md-sys-state-hover-opacity)] 
                peer-active:opacity-[var(--md-sys-state-pressed-opacity)]"></div>
  </div>
  
  <!-- Caption -->
  <span class="md-label-large text-on-surface peer-disabled:opacity-38">Checkbox Caption</span>
</label>
```

## 2. Props/Attributes Interface

The component will be built using the `CheckboxBuilder` class, adhering to the project's builder pattern.

| Method | Argument | Description |
|--------|----------|-------------|
| `withCaption(caption: Observable<string>)` | `Observable<string>` | Sets the text label next to the checkbox. |
| `withEnabled(enabled: Observable<boolean>)` | `Observable<boolean>` | Controls the disabled state. |
| `withClass(className: Observable<string>)` | `Observable<string>` | Appends custom CSS classes to the root element. |
| `withValue(value: Subject<boolean>)` | `Subject<boolean>` | Two-way binding for the checked state. |
| `asGlass()` | - | Applies a transparent background with backdrop-blur. |

## 3. State Management

- **Checked**: Managed via `withValue(Subject<boolean>)`. The internal state of the native input should stay in sync with this subject. Changes to the native input (via user interaction) should be pushed back to the subject.
- **Indeterminate**: While not explicitly in the documentation methods, it can be supported internally or by checking the value type if it were to support a tri-state. For now, we will focus on boolean.
- **Disabled**: Managed via `withEnabled(Observable<boolean>)`. Disables both the native input and the visual container's interactions.
- **Glass Effect**: A boolean flag set by `asGlass()` that toggles specific Tailwind classes for glassmorphism.

## 4. Styling Requirements

- **Theme**: Use Tailwind CSS with Material Design 3 tokens (e.g., `bg-primary`, `text-on-surface`, `border-outline`).
- **Responsive**: Ensure the touch target is at least 48x48px (using `md-touch-target` or equivalent padding).
- **Glass Effect**: 
  - `bg-white/10` or `bg-surface/10`
  - `backdrop-blur-md`
  - `border-white/20`
- **Transitions**: Smooth transitions for background color, border, and icon scaling (150ms-200ms duration).

## 5. Accessibility Requirements

- **Role**: Use native `<input type="checkbox">` which provides the `checkbox` role automatically.
- **Aria Attributes**: 
  - `aria-checked` (handled by native input).
  - `aria-label` or `aria-labelledby` (if caption is provided).
- **Keyboard Interaction**:
  - `Space`: Toggle checked state.
  - `Tab`: Focus the element.
- **Focus Indicator**: Use a high-contrast focus ring (`ring-2 ring-primary`).

## 6. Implementation Plan

### File Structure
```
src/components/checkbox/
├── index.ts        # Public API export
├── checkbox.ts     # Main builder class implementation
├── styles.ts       # Tailwind class constants (optional, if complex)
└── checkbox.test.ts # Unit tests
```

### Steps
1. Create `src/components/checkbox/checkbox.ts` and define `CheckboxBuilder`.
2. Implement the `build()` method:
   - Create the DOM structure (label, input, visual box, caption).
   - Subscribe to observables (caption, enabled, class, value).
   - Implement event listeners for the input to update the `value$` Subject.
   - Register cleanup in `registerDestroy`.
3. Export from `src/components/checkbox/index.ts`.
4. Add stories in `src/stories/checkbox.stories.ts` to verify implementation.
5. Write tests in `src/components/checkbox/checkbox.test.ts`.
