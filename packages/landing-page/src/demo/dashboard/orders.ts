import { PanelBuilder, GridBuilder, LabelBuilder } from 'aura-components';
import { of } from 'rxjs';

export function createOrders(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex-1 overflow-y-auto p-px-24';

    const panel = new PanelBuilder()
        .withContent(new LabelBuilder().withCaption(of('Recent Orders')))
        .build();
    panel.classList.add('h-full', 'flex', 'flex-col');

    const body = panel.querySelector('.panel-body');
    if (body) {
        body.classList.add('flex-1', 'min-h-0');
        
        const data$ = of([
            { id: '#ORD-001', customer: 'Alice Johnson', date: '2026-03-16', total: 125.50, status: 'Shipped' },
            { id: '#ORD-002', customer: 'Bob Smith', date: '2026-03-15', total: 85.00, status: 'Processing' },
            { id: '#ORD-003', customer: 'Charlie Brown', date: '2026-03-15', total: 240.00, status: 'Delivered' },
            { id: '#ORD-004', customer: 'Diana Prince', date: '2026-03-14', total: 45.99, status: 'Cancelled' },
            { id: '#ORD-005', customer: 'Ethan Hunt', date: '2026-03-14', total: 320.00, status: 'Shipped' },
            { id: '#ORD-006', customer: 'Fiona Gallagher', date: '2026-03-13', total: 15.20, status: 'Delivered' },
            { id: '#ORD-007', customer: 'George Miller', date: '2026-03-13', total: 99.99, status: 'Processing' },
            { id: '#ORD-008', customer: 'Hannah Abbott', date: '2026-03-12', total: 54.50, status: 'Shipped' },
        ]);

        const grid = new GridBuilder()
            .withItems(data$);
            
        const columns = grid.withColumns();
        columns.addTextColumn('id').withHeader('Order ID').withWidth('120px');
        columns.addTextColumn('customer').withHeader('Customer').withWidth('flex');
        columns.addTextColumn('date').withHeader('Date').withWidth('150px');
        columns.addNumberColumn('total').withHeader('Total').withWidth('100px');
        columns.addTextColumn('status').withHeader('Status').withWidth('120px');

        body.appendChild(grid.build());
    }

    container.appendChild(panel);

    return container;
}
