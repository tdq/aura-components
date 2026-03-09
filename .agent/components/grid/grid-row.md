# Grid Row

## Description
The `GridRow` class renders a single row, its cells, selection checkbox, and row actions. It is optimized for efficient rendering within the `GridViewport`.

## Responsibilities
- **Row Rendering**: Renders the absolute-positioned row element with the correct `top` position.
- **Cell Rendering**: Iterates through `GridColumn` objects and calls their `render()` method to populate cells.
- **Selection Handling**: Manages the row-level selection state, updating both the checkbox and the row's background highlight using cached element references.
- **Action Rendering**: Renders per-row action buttons in a dedicated `actionCell`.

## Components
- **Element**: An absolute-positioned flex container (`GridStyles.row`).
- **Checkbox Cell**: Renders the row-level selection checkbox (cached as `checkbox`).
- **Cell**: Renders individual column content, applying the specified column width.
- **Action Cell**: Renders contextual buttons, pinned to the right (`sticky right-0`, cached as `actionCell`).

## Methods
- `getElement()`: Returns the row's DOM element.
- `update(item: ITEM, index: number, isSelected: boolean)`: Updates the row with new data or position. Clears cached element references and re-populates the DOM.
- `updateSelection(isSelected: boolean)`: Optimized to update only the selection-related visual states. Uses cached `checkbox` and `actionCell` references to avoid expensive DOM queries. It skips updates if the selection state hasn't changed.
- `updateColumns(columns: GridColumn<ITEM>[])`: Updates all cells when column widths are resized.

## Implementation Details
- **Performance**: Selection updates are highly optimized. By caching the checkbox and action cell during the initial `populateRow` call, the `updateSelection` method avoids `querySelector` or `Array.from` lookups during scroll-heavy selection changes.
- **State Guard**: `updateSelection` includes a guard clause `if (this.isSelected === isSelected) return;` to prevent unnecessary DOM manipulations.
