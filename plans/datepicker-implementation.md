# DatePicker Implementation Plan

## Overview
Implement a datepicker component using the builder pattern, RxJS for reactivity, and Tailwind CSS for styling.

## 1. Utilities (`src/components/date-picker/date-utils.ts`)
- `formatDate(date: Date, format: string): string`
  - Support `YYYY`, `MM`, `DD` at minimum.
- `parseDate(str: string, format: string): Date | null`
  - Strict parsing based on format.
- `getDaysInMonth(year: number, month: number): number`
- `getFirstDayOfMonth(year: number, month: number): number`
- `isSameDay(d1: Date, d2: Date): boolean`
- `isValidDate(d: any): d is Date`

## 2. Calendar Component (`src/components/date-picker/calendar.ts`)
- `renderCalendar(options: CalendarOptions): HTMLElement`
- Reactive updates for:
  - Current view month/year.
  - Selected date.
  - Min/Max constraints.
- Features:
  - Month/Year header with prev/next buttons.
  - Day names (Su, Mo, Tu, etc.).
  - Grid of days.
  - Highlight current selected date.
  - Disable dates outside min/max range.

## 3. Main Builder (`src/components/date-picker/date-picker.ts`)
- `DatePickerBuilder` class.
- Methods:
  - `withValue(value: Subject<Date | null>)`
  - `withCaption(caption: Observable<string>)`
  - `withMinDate(min: Observable<Date>)`
  - `withMaxDate(max: Observable<Date>)`
  - `withFormat(format: string)`
  - `withEnabled(enabled: Observable<boolean>)`
  - `withError(error: Observable<string>)`
  - `asGlass()`
- `build()` logic:
  - Create input container.
  - Create text input for manual entry.
  - Create calendar icon button to toggle popup.
  - Create popup container for the calendar.
  - Wire up RxJS observables to sync input <-> calendar <-> value$.
  - Handle click outside to close.
  - Accessibility: `aria-expanded`, keyboard nav (Enter/Esc/Arrows).

## 4. Testing (`src/components/date-picker/date-picker.test.ts`)
- Test manual entry validation.
- Test calendar selection.
- Test min/max constraints.
- Test glass effect application.
- Test keyboard navigation.

## 5. Storybook (`src/stories/date-picker.stories.ts`)
- Default datepicker.
- With min/max dates.
- Glass mode.
- Error state.
- Disabled state.
