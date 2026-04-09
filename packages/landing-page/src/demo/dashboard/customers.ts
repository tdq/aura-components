import { PanelBuilder, GridBuilder, LabelBuilder } from 'aura-components';
import { of } from 'rxjs';

export function createCustomers(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex-1 overflow-y-auto p-px-24';

    const panel = new PanelBuilder()
        .withContent(new LabelBuilder().withCaption(of('Customer Management')))
        .build();
    panel.classList.add('h-full', 'flex', 'flex-col');

    const body = panel.querySelector('.panel-body');
    if (body) {
        body.classList.add('flex-1', 'min-h-0');
        
        const data$ = of([
            { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active', lastLogin: '2026-03-16 10:24' },
            { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', status: 'Inactive', lastLogin: '2026-03-15 14:12' },
            { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Editor', status: 'Active', lastLogin: '2026-03-15 09:45' },
            { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'User', status: 'Active', lastLogin: '2026-03-14 11:30' },
            { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', role: 'Admin', status: 'Active', lastLogin: '2026-03-14 08:20' },
            { id: 6, name: 'Fiona Gallagher', email: 'fiona@example.com', role: 'User', status: 'Pending', lastLogin: '2026-03-13 16:15' },
            { id: 7, name: 'George Miller', email: 'george@example.com', role: 'Editor', status: 'Active', lastLogin: '2026-03-13 13:40' },
            { id: 8, name: 'Hannah Abbott', email: 'hannah@example.com', role: 'User', status: 'Active', lastLogin: '2026-03-12 10:05' },
            { id: 9, name: 'Ian Wright', email: 'ian@example.com', role: 'User', status: 'Inactive', lastLogin: '2026-03-11 15:50' },
            { id: 10, name: 'Julia Roberts', email: 'julia@example.com', role: 'Editor', status: 'Active', lastLogin: '2026-03-10 11:20' },
        ]);

        const grid = new GridBuilder()
            .withItems(data$);
            
        const columns = grid.withColumns();
        columns.addTextColumn('name').withHeader('Name').withWidth('flex');
        columns.addTextColumn('email').withHeader('Email').withWidth('flex');
        columns.addTextColumn('role').withHeader('Role').withWidth('120px');
        columns.addTextColumn('status').withHeader('Status').withWidth('120px');
        columns.addTextColumn('lastLogin').withHeader('Last Login').withWidth('180px');

        body.appendChild(grid.build());
    }

    container.appendChild(panel);

    return container;
}
