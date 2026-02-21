# Plan: TextField Component Improvements

Based on the analysis of [`src/components/text-field/text-field.ts`](src/components/text-field/text-field.ts), this plan outlines the necessary changes to fix bugs, improve code quality, and align with the specification.

## 1. Architectural Changes

### Reactive Class Management
- **Issue**: Mixing `cn()` and `classList.add()` in subscriptions leads to inconsistent state and bugs.
- **Solution**: Derive all classes through a single `combineLatest` stream. The `input.className` should be updated once per emission, ensuring that the visual state is always a pure function of the component's properties.

### Validation Logic
- **Issue**: Email validation is hardcoded inside the `build()` method.
- **Solution**: Move validation logic to a separate utility or allow users to provide custom validation observables. The `TextFieldBuilder` should focus on orchestration.

### Memory Management
- **Issue**: Event listeners are added directly (e.g., `input.oninput`).
- **Solution**: Use `fromEvent` from RxJS for event handling and ensure all subscriptions are cleaned up via `registerDestroy`.

## 2. Specific Fixes

### Enum Mismatch & Style Naming
- Update `TextFieldStyle` enum:
  - `FILLED` -> `TONAL` ('tonal')
  - `OUTLINED` -> `OUTLINED` ('outlined')
- Update `STYLE_MAP` to reflect the correct Material Design 3 tonal/outlined styles.

### Tailwind Classes
- Fix typos and "magic" classes:
  - `px-px-16` -> `px-4`
  - `py-px-12` -> `py-3`
  - `gap-px-4` -> `gap-1`
- Ensure standard Tailwind spacing scale is used.

### Mutually Exclusive Types
- Replace `isPassword` and `isEmail` flags with a more flexible `type$` observable (defaulting to 'text').
- Ensure `asPassword()` and `asEmail()` set this type correctly.

### Password Symbols
- The specification mentions "display '*' symbols". 
- **Implementation**: If strict compliance is needed, we will implement a custom masking logic that updates the display value with `*` while keeping the real value in the background, or use `-webkit-text-security: disc` (or similar) if CSS is enough. *Preferred: Use a custom masking approach or clarify if `type="password"` bullets are acceptable.*

### Accessibility
- Use a `<label>` element instead of a `<span>` for the label.
- Generate a unique ID for the input and associate it with the label's `for` attribute.
- Add `aria-invalid` and `aria-describedby` when an error is present.

## 3. New Properties and Methods

| Method | Description |
|--------|-------------|
| `withName(name: string)` | Sets the `name` attribute for form integration. |
| `withRequired(required: Observable<boolean>)` | Sets the `required` attribute. |
| `withReadOnly(readOnly: Observable<boolean>)` | Sets the `readonly` attribute. |
| `withPlaceholder(placeholder: Observable<string>)` | Sets the `placeholder` attribute (existing, but ensure reactive). |
| `withAutocomplete(value: string)` | Sets the `autocomplete` attribute. |
| `onFocus(): Observable<FocusEvent>` | Returns an observable for focus events. |
| `onBlur(): Observable<FocusEvent>` | Returns an observable for blur events. |
| `onChange(): Observable<Event>` | Returns an observable for change events. |

## 4. Implementation Steps

1.  **Refactor Constants & Enums**:
    - Update `TextFieldStyle` and `STYLE_MAP`.
    - Define `BASE_INPUT_CLASSES` as a constant outside the builder.
2.  **State Management**:
    - Convert `isGlass`, `isPassword`, `isEmail` into reactive streams or consolidate them into a configuration object.
3.  **Refactor `build()` Method**:
    - Create the container, label (as `<label>`), input, and error elements.
    - Setup a single `combineLatest` to handle classes for the input.
    - Setup subscriptions for attributes (`placeholder`, `disabled`, `readonly`, `required`, `type`, `name`, `id`).
    - Implement `aria-*` attribute updates based on error state.
4.  **Event Handling**:
    - Use `fromEvent(input, 'input')` to update `value$`.
    - Expose `focus`, `blur`, `change` observables.
5.  **Validation Extraction**:
    - Move email validation logic to a dedicated helper.
6.  **Password Masking (if required)**:
    - Implement the `*` symbol display logic if `type="password"` is deemed insufficient.
7.  **Cleanup**:
    - Ensure `registerDestroy` covers all created subscriptions.
