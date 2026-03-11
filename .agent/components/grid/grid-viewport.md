# Grid Viewport

## Description
The `GridViewport` class handles the virtualization and scroll management for the grid, ensuring only visible rows are rendered to maintain performance.

## Virtualization Logic
- **Row Height**: Fixed at `52px` (as defined in `GridStyles`).
- **Buffer**: Extra rows (default: `5`) are rendered above and below the visible viewport to prevent flickering during scrolls.
- **Rendering Loop**: `renderVisibleRows()` calculates the visible range based on `scrollTop` and `clientHeight` of the viewport element.
- **Dynamic Resizing**: Uses a `ResizeObserver` to automatically trigger `renderVisibleRows()` whenever the viewport's dimensions change. This ensures the correct number of rows is displayed even if the grid's initial size is zero or changes after initialization.

## Components
- **Element**: The main container with `overflow-auto`.
- **Content Element**: A child container with a calculated `height` matching the total items count.
- **Header Sync**: Supports adding a `GridHeader` element into the viewport (before the content) to ensure horizontal scroll synchronization.

## Methods
- `update(rows: GridRowData<ITEM>[], selected: Set<ITEM>)`: Updates the virtualization state with new rows (items or group headers) and selection changes.
- `updateColumns(columns: GridColumn<ITEM>[])`: Propagates column changes to all currently rendered data rows.
- `addHeader(headerElement: HTMLElement)`: Inserts a header element into the viewport.
- `handleScroll()`: Throttled event listener using `requestAnimationFrame`.
- `destroy()`: Disconnects the `ResizeObserver`.

## Implementation Details
- **Rendering Storage**: Rendered rows are stored in a `Map<number, GridRow<ITEM> | GridGroupRow>`, where the key is the row index.
- **Mixed Content**: `renderVisibleRows()` inspects the `type` of each `GridRowData` to instantiate and manage either a `GridRow` or a `GridGroupRow`. It handles row recycling by checking the instance type of existing cached rows.
