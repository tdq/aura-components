# Actions Builder

## Description
The `ActionsBuilder` is used to define a set of contextual actions that appear for each row in the grid. These actions are rendered in a dedicated column pinned to the right end of the row.

## Builder Methods
- `addAction(icon: string, label: string, onClick: (item: ITEM) => void): this`: Adds an action button. `icon` is a string with svg.

## Implementation Details
- **Data Structure**: `GridAction<ITEM>` interface is defined in `types.ts`.
- **Rendering**: Row actions are rendered as buttons within an `actionCell` by the `GridRow` class.
- **Event Handling**: Clicks on row actions are isolated using `e.stopPropagation()` to prevent triggering row selection.
- **Sticky Behavior**: The actions column is pinned to the right (`sticky right-0`). The styling is defined in `GridStyles.actionCell`.
- **Accessibility**: Each button has `aria-label` set to the action `label`.

## Styling
- **Default Appearance**: Defined by `GridStyles.actionButton`. Rendered as rounded-full buttons that gain a background on hover.
- **Icon Actions**: Use a class-based icon system (e.g., `<i class="fa fa-edit"></i>`).
- **Column Width**: Auto-scales based on the number of actions: `actions.length * 36 + 8` px, set as an inline style on both the action cell and header cell.
- **Tooltip**: Rendered as a CSS-only MD3 plain tooltip using `GridStyles.tooltipWrapper` and `GridStyles.tooltip`. Hover is scoped with Tailwind's named group `group/action`. No JavaScript is used for tooltip positioning.
- **Performance**: Sticky cells use an opaque background (`bg-surface-container-low/80`) instead of backdrop blur to maintain high frame rates during scroll.
