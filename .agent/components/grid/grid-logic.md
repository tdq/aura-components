# Grid Logic

## Description
The `GridLogic` class manages the reactive state of the grid, including sorting, selection, and item processing. It is decoupled from the UI to ensure testability and clear separation of concerns.

## State Management
Uses RxJS `BehaviorSubject` to track:
- `_items$`: The raw data items.
- `_selectedItems$`: A `Set` of currently selected items.
- `_sortConfig$`: The current `SortConfig` (field and direction).
- `_groupBy$`: The current array of fields to group by.
- `_expandedGroups$`: A `Set` of group keys (serialized JSON paths) that are expanded.

## Key Observables
- `sortedItems$`: Emits the items array sorted by the current sort configuration.
- `state$`: A combined observable emitting `GridState<ITEM>`, which includes `items`, `rows` (flattened and grouped `GridRowData`), `selectedItems`, and `sortConfig`.
- `selectedItems$`: Emits the current set of selected items.
- `sortConfig$`: Emits the current sorting configuration.

## Methods
- `setItems(items$: Observable<ITEM[]>)`: Subscribes to an external items observable.
- `setGrouping(groupBy$: Observable<string[]>)`: Subscribes to the grouping configuration observable.
- `setSort(field: string, direction: SortDirection)`: Updates the sorting configuration.
- `toggleGroup(groupKey: string)`: Toggles the expansion state of a specific group.
- `toggleSelection(item: ITEM)`: Toggles an item's presence in the selection set.
- `setSelectedItems(selected: Set<ITEM>)`: Replaces the entire selection set.
- `destroy()`: Cleans up internal subscriptions.

## Implementation Details
Sorting is performed in-memory. Grouping is implemented via a recursive function that:
1.  Segments items by the current grouping level's field.
2.  Creates a `GridGroupHeader` for each segment.
3.  If the group is expanded, recursively processes the next grouping level or adds the leaf `ITEM` rows.
4.  Leaf items within groups are sorted according to the current `SortConfig`.
