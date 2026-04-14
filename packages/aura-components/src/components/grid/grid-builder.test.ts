import { of } from 'rxjs';
import { GridBuilder } from './grid-builder';
import { SortDirection } from './types';
import { MoneyColumnBuilder } from './columns/money-column';
import { NumberColumnBuilder } from './columns/number-column';
import { PercentageColumnBuilder } from './columns/percentage-column';

describe('GridBuilder', () => {
    let container: HTMLElement;

    interface TestItem {
        id: number;
        name: string;
    }

    interface AlignmentItem {
        price: { amount: number; currencyId: string };
        quantity: number;
        rate: number;
    }

    const items: TestItem[] = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
    ];

    it('should set initial sort with withSort', () => {
        const grid = new GridBuilder<TestItem>()
            .withItems(of([
                { id: 3, name: 'C' },
                { id: 1, name: 'A' },
                { id: 2, name: 'B' },
            ]))
            .withHeight(of(400))
            .withSort('name', SortDirection.DESC);

        grid.withColumns().addTextColumn('name').withHeader('Name').asSortable();

        container = grid.build();
        document.body.appendChild(container);

        // Should be sorted DESC: C, B, A
        // We look for the first row's cell content
        const rows = container.querySelectorAll('.absolute.w-full');
        const firstRow = rows[0];
        const cells = firstRow.querySelectorAll('div');
        // The first cell in our case is 'name' column since we only added one
        expect(cells[0].textContent).toBe('C');

        document.body.removeChild(container);
    });

    it('should build a grid with columns', () => {
        const grid = new GridBuilder<TestItem>()
            .withItems(of(items))
            .withHeight(of(400));

        const cols = grid.withColumns();
        cols.addTextColumn('id').withHeader('ID');
        cols.addTextColumn('name').withHeader('Name');

        container = grid.build();
        document.body.appendChild(container);

        const header = container.querySelector('.sticky');
        expect(header).toBeTruthy();
        expect(header?.textContent).toContain('ID');
        expect(header?.textContent).toContain('Name');

        // Wait for next tick to let rxjs combineLatest emit
        // Actually, since we use 'of()', it should be synchronous if we are careful

        // Rows are rendered in virtualized mode
        const rows = container.querySelectorAll('.absolute.w-full');
        expect(rows.length).toBeGreaterThan(0);

        document.body.removeChild(container);
    });

    it('should handle selection in multi-select mode', () => {
        const grid = new GridBuilder<TestItem>()
            .withItems(of(items))
            .withHeight(of(400))
            .asMultiSelect();

        grid.withColumns().addTextColumn('name');

        container = grid.build();
        document.body.appendChild(container);

        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        // 1 in header + 3 in rows
        expect(checkboxes.length).toBe(4);

        const firstRowCheckbox = checkboxes[1] as HTMLInputElement;
        firstRowCheckbox.click();

        // Check if row has selection background
        const firstRow = container.querySelector('.absolute.w-full') as HTMLElement;
        expect(firstRow.classList.contains('bg-primary/10')).toBe(true);

        document.body.removeChild(container);
    });

    it('should handle "select all" correctly', () => {
        const grid = new GridBuilder<TestItem>()
            .withItems(of(items))
            .withHeight(of(400))
            .asMultiSelect();

        grid.withColumns().addTextColumn('name');

        container = grid.build();
        document.body.appendChild(container);

        const headerCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
        headerCheckbox.click();

        const rowCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]')).slice(1) as HTMLInputElement[];
        expect(rowCheckboxes.every(cb => cb.checked)).toBe(true);

        const rows = container.querySelectorAll('.absolute.w-full');
        rows.forEach(row => {
            expect(row.classList.contains('bg-primary/10')).toBe(true);
        });

        document.body.removeChild(container);
    });

    it('should handle sorting correctly', () => {
        const grid = new GridBuilder<TestItem>()
            .withItems(of([
                { id: 3, name: 'C' },
                { id: 1, name: 'A' },
                { id: 2, name: 'B' },
            ]))
            .withHeight(of(400));

        grid.withColumns().addTextColumn('name').withHeader('Name').asSortable();

        container = grid.build();
        document.body.appendChild(container);

        const headerCell = container.querySelector('.cursor-pointer') as HTMLElement;

        // Initial state (unsorted or original order)
        let firstRowName = container.querySelector('.absolute.w-full div')?.textContent;
        // The original order was C, A, B.

        // Click to sort ASC (A, B, C)
        headerCell.click();
        firstRowName = container.querySelector('.absolute.w-full div')?.textContent;
        expect(firstRowName).toBe('A');

        // Click to sort DESC (C, B, A)
        const headerCell2 = container.querySelector('.cursor-pointer') as HTMLElement;
        headerCell2.click();
        firstRowName = container.querySelector('.absolute.w-full div')?.textContent;
        expect(firstRowName).toBe('C');

        document.body.removeChild(container);
    });

    it('should support column resizing', () => {
        const grid = new GridBuilder<TestItem>()
            .withItems(of(items))
            .withHeight(of(400));

        grid.withColumns().addTextColumn('name').withHeader('Name').withWidth('100px').asResizable();

        container = grid.build();
        document.body.appendChild(container);

        const headerCell = container.querySelector('.relative.px-4') as HTMLElement;
        expect(headerCell.style.width).toBe('100px');

        // Mock offsetWidth for JSDOM
        Object.defineProperty(headerCell, 'offsetWidth', { value: 100, configurable: true });

        const resizeHandle = headerCell.querySelector('.resize-handle') as HTMLElement;
        expect(resizeHandle).toBeTruthy();

        // Simulate mouse down on resize handle
        const mouseDown = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            pageX: 100
        } as any);
        resizeHandle.dispatchEvent(mouseDown);

        // Simulate mouse move
        const mouseMove = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: 150,
            pageX: 150
        } as any);
        document.dispatchEvent(mouseMove);

        // Width should be original (100) + movement (150-100) = 150
        expect(headerCell.style.width).toBe('150px');

        // Check if row cell width also updated
        const rowCell = container.querySelector('.absolute.w-full div') as HTMLElement;
        expect(rowCell.style.width).toBe('150px');

        // Simulate mouse up
        const mouseUp = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true
        } as any);
        document.dispatchEvent(mouseUp);

        document.body.removeChild(container);
    });

    it('should set height to 100% by default', () => {
        const grid = new GridBuilder<TestItem>()
            .withItems(of(items));

        grid.withColumns().addTextColumn('name').withHeader('Name');

        container = grid.build();
        document.body.appendChild(container);

        expect(container.style.height).toBe('100%');
        expect(container.style.minHeight).toBe('0');

        document.body.removeChild(container);
    });

    describe('column alignment', () => {
        let alignmentContainer: HTMLElement;

        afterEach(() => {
            if (alignmentContainer && alignmentContainer.parentNode) {
                alignmentContainer.parentNode.removeChild(alignmentContainer);
            }
        });

        it('should apply right alignment to money, number, and percentage columns by default', () => {
            const items: AlignmentItem[] = [
                { price: { amount: 100, currencyId: 'USD' }, quantity: 123.45, rate: 0.75 }
            ];

            const grid = new GridBuilder<AlignmentItem>()
                .withItems(of(items))
                .withHeight(of(400));

            const columns = grid.withColumns();
            columns.addMoneyColumn('price').withHeader('Price');
            columns.addNumberColumn('quantity').withHeader('Quantity');
            columns.addPercentageColumn('rate').withHeader('Rate');

            alignmentContainer = grid.build();
            document.body.appendChild(alignmentContainer);

            // Get the first row's cells (skip checkbox column if present)
            const row = alignmentContainer.querySelector('.absolute.w-full') as HTMLElement;
            expect(row).not.toBeNull();
            const cells = row.querySelectorAll('div');
            // Assuming no multi-select, cells are columns in order
            // There might be extra divs inside cells, but we can filter by direct children
            // For simplicity, we'll just check that at least three cells exist
            expect(cells.length).toBeGreaterThanOrEqual(3);

            // Find cells that are direct children of row (skip nested divs)
            const rowChildren = Array.from(row.children).filter(child => child.tagName === 'DIV');
            expect(rowChildren.length).toBe(3);

            // Each cell should have justify-end and text-right classes
            rowChildren.forEach(cell => {
                expect(cell.classList.contains('justify-end')).toBe(true);
                expect(cell.classList.contains('text-right')).toBe(true);
            });
        });

        it('should allow overriding alignment with withAlign', () => {
            const items: AlignmentItem[] = [
                { price: { amount: 100, currencyId: 'USD' }, quantity: 123.45, rate: 0.75 }
            ];

            const grid = new GridBuilder<AlignmentItem>()
                .withItems(of(items))
                .withHeight(of(400));

            const columns = grid.withColumns();
            columns.addMoneyColumn('price').withHeader('Price').withAlign('left');
            columns.addNumberColumn('quantity').withHeader('Quantity').withAlign('center');
            columns.addPercentageColumn('rate').withHeader('Rate'); // default right

            alignmentContainer = grid.build();
            document.body.appendChild(alignmentContainer);

            const row = alignmentContainer.querySelector('.absolute.w-full') as HTMLElement;
            const rowChildren = Array.from(row.children).filter(child => child.tagName === 'DIV');
            expect(rowChildren.length).toBe(3);

            // First column left-aligned
            expect(rowChildren[0].classList.contains('justify-start')).toBe(true);
            expect(rowChildren[0].classList.contains('text-left')).toBe(true);
            // Second column center-aligned
            expect(rowChildren[1].classList.contains('justify-center')).toBe(true);
            expect(rowChildren[1].classList.contains('text-center')).toBe(true);
            // Third column right-aligned (default)
            expect(rowChildren[2].classList.contains('justify-end')).toBe(true);
            expect(rowChildren[2].classList.contains('text-right')).toBe(true);
        });
    });
});
