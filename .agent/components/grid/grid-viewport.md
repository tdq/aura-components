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
- `update(items: ITEM[], selected: Set<ITEM>)`: Updates the virtualization state with new items or selection changes.
- `updateColumns(columns: GridColumn<ITEM>[])`: Propagates column changes (like resizing) to all currently rendered rows.
- `addHeader(headerElement: HTMLElement)`: Inserts a header element into the viewport.
- `handleScroll()`: Throttled event listener using `requestAnimationFrame`. Ensures visible rows are recalculated only once per frame during active scrolling.
- `destroy()`: Disconnects the `ResizeObserver` and performs necessary cleanup.

## Implementation Details
- **Rendering Storage**: Rendered rows are stored in a `Map<number, GridRow<ITEM>>`, where the key is the row index.
- **Scroll Throttling**: The scroll listener uses a `ticking` boolean flag and `requestAnimationFrame` to ensure the main thread is not overwhelmed by rapid scroll events. This is critical for maintaining 60fps performance on high-density displays or mobile devices.
