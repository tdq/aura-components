# Icons

## Description
The `Icons` class is a centralized registry of SVG icons and icon class constants used throughout the library. It ensures visual consistency and simplifies icon management.

## Location
- Source: `src/core/icons.ts`

## Available Icons

### Standard SVGs (Strings)
These constants contain literal SVG strings. They should be used with `innerHTML` or passed to components that support SVG content.

- `Icons.EYE_OPEN`: Eye icon for showing passwords.
- `Icons.EYE_CLOSED`: Strikethrough eye icon for hiding passwords.
- `Icons.CHEVRON_LEFT`: Left-pointing chevron for pagination and calendars.
- `Icons.CHEVRON_RIGHT`: Right-pointing chevron for pagination and calendars.
- `Icons.CHEVRON_DOWN`: Down-pointing chevron for dropdowns.
- `Icons.EXPAND`: Alias for `Icons.CHEVRON_DOWN`.
- `Icons.CALENDAR`: Calendar icon for date pickers.
- `Icons.ERROR`: Warning/Error icon for validation messages.
- `Icons.CHECKMARK`: Checkmark for checkboxes and success states.

### Icon Classes (Strings)
These constants contain CSS class names for font-based icon sets (e.g., FontAwesome).

- `Icons.SORT`: Default sort icon class.
- `Icons.SORT_UP`: Ascending sort icon class.
- `Icons.SORT_DOWN`: Descending sort icon class.

## Usage Example

### In a Component Builder
```typescript
import { Icons } from '@/core/icons';

new ButtonBuilder()
    .withCaption(of('Search'))
    .withIcon(Icons.EXPAND)
    .build();
```

### Manual Insertion
```typescript
import { Icons } from '@/core/icons';

const element = document.createElement('div');
element.innerHTML = Icons.CALENDAR;
```

### With Class Replacements
If you need to inject custom Tailwind classes into the SVG:
```typescript
element.innerHTML = Icons.ERROR.replace('<svg', '<svg class="w-5 h-5 text-error"');
```
