Layout component is a component which is used for layout of the page. It has the following methods:
- addSlot(): SlotBuilder - adds new slot to the layout. IT can have one child component.
- asVertical(): LayoutBuilder - sets layout to vertical.
- asHorizontal(): LayoutBuilder - sets layout to horizontal.
- withGap(gap: LayoutGap): LayoutBuilder - sets gap between slots.
- withClass(className: Observable<string>): LayoutBuilder - sets class css name of the layout.

Layout omponent should have full width.

LayoutGap is a enum with values:
- SMALL. 4px gap
- MEDIUM. 8px gap
- LARGE. 16px gap
- EXTRA_LARGE. 32px gap

LayoutGap defines the gap between slots. Default value is MEDIUM.

SlotBuilder has the following methods:
- withContent(content: ComponentBuilder): SlotBuilder - sets content of the slot.
- withSize(size: SlotSize): SlotBuilder - sets size of the slot.
- withVisible(visible: Observable<boolean>): SlotBuilder - sets visibility of the slot.

SlotSize is a enum with values:
- QUARTER. 1/4 of available space
- THIRD. 1/3 of available space
- HALF. 1/2 of available space
- TWO_THIRDS. 2/3 of available space
- THREE_QUARTERS. 3/4 of available space
- FULL. 1 of available space

SlotSize defines the size of the slot. Default value is calculated based on the number of slots (min QUARTER, max FULL). 
For vertical layout default slot size is not set (size of content).
Slot size can be shrinked or growed based on available space.