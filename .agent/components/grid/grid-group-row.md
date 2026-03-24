# Grid Group Row

## Description
The `GridGroupRow` class renders a collapsible header row for a group of items. It allows users to expand or collapse the group to show or hide its child items.

## Responsibilities
- **Header Rendering**: Renders a full-width row indicating the group's field, value, and total item count.
- **Expansion Toggle**: Renders a chevron icon that indicates and controls the group's expansion state.
- **Indentation**: Applies horizontal padding based on the nesting `level` to provide visual hierarchy in multi-level grouping.

## Components
- **Element**: An absolute-positioned flex container (`GridStyles.groupRow`) positioned via `transform: translateY`.
- **Toggle Icon**: A chevron icon (`w-5 h-5`, uses `Icons.CHEVRON_RIGHT`) that rotates 90 degrees when expanded.
- **Label**: Displays the field name (e.g., "Category:").
- **Value**: Displays the specific group value (e.g., "Electronics").
- **Count**: Displays the total number of items within the group in parentheses.

## Methods
- `getElement()`: Returns the group row's DOM element.
- `getHeader()`: Returns the current `GridGroupHeader` data.
- `update(header: GridGroupHeader, index: number)`: Updates the header data and absolute position using `transform`. Synchronizes the toggle rotation and content text without full re-rendering.

## Implementation Details
- **Interactivity**: The entire row element is clickable, triggering the `onToggle` callback passed during construction.
- **Styling**: Uses `bg-surface-container-high` to ensure group headers remain visually distinct.
- **Performance**: Uses `transform: translateY` for positioning and `will-change: transform` to ensure the row is promoted to its own compositor layer. High-cost filters like `backdrop-blur` are avoided to maintain high frame rates during scroll.
- **Hierarchy**: Indentation is calculated as `level * 24px`, ensuring consistent alignment with child groups or items.
