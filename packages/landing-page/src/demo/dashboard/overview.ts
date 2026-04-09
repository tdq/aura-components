import { PanelBuilder, ChartBuilder, GridBuilder, LabelBuilder } from 'aura-components';
import { of, timer, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export function createOverview(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex-1 overflow-y-auto p-px-24';

    // Stats Grid
    const statsGrid = createStatsGrid();
    container.appendChild(statsGrid);

    // Charts & Grid Section
    const mainGrid = document.createElement('div');
    mainGrid.className = 'grid grid-cols-1 lg:grid-cols-2 gap-px-24 mt-px-24';

    mainGrid.appendChild(createSalesChart());
    mainGrid.appendChild(createTransactionsGrid());

    container.appendChild(mainGrid);

    return container;
}

function createStatsGrid(): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px-16';

    const stats = [
        { label: 'Total Sales', value: '$124,592', trend: '+12.5%', positive: true, color: '#6750A4', colorLight: 'rgba(103,80,164,0.08)' },
        { label: 'Active Users', value: '12,482', trend: '+5.2%', positive: true, color: '#625B71', colorLight: 'rgba(98,91,113,0.08)' },
        { label: 'Orders', value: '1,248', trend: '-2.1%', positive: false, color: '#7D5260', colorLight: 'rgba(125,82,96,0.08)' },
        { label: 'Conversion', value: '3.2%', trend: '+0.8%', positive: true, color: '#6750A4', colorLight: 'rgba(103,80,164,0.08)' }
    ];

    stats.forEach(s => {
        const card = document.createElement('div');
        card.className = 'p-px-24 rounded-extra-large border';
        card.style.cssText = `background: var(--md-sys-color-surface); border-color: rgba(121,116,126,0.1); position: relative; overflow: hidden;`;

        card.innerHTML = `
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2" style="background: radial-gradient(circle, ${s.colorLight}, transparent);"></div>
            <div class="flex items-center justify-between mb-px-12">
                <span class="text-label-medium text-on-surface-variant" style="opacity: 0.6;">${s.label}</span>
                <div class="w-8 h-8 rounded-large flex items-center justify-center" style="background: ${s.colorLight};">
                    <span class="w-2 h-2 rounded-full" style="background: ${s.color};"></span>
                </div>
            </div>
            <div class="flex items-baseline justify-between">
                <span class="text-headline-medium text-on-surface font-bold" style="letter-spacing: -0.02em;">${s.value}</span>
                <span class="text-label-small font-semibold px-px-8 py-px-4 rounded-full" style="background: ${s.positive ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)'}; color: ${s.positive ? '#16a34a' : '#dc2626'};">${s.trend}</span>
            </div>
        `;

        grid.appendChild(card);
    });

    return grid;
}

function createSalesChart(): HTMLElement {
    const panel = new PanelBuilder()
        .withContent(new LabelBuilder().withCaption(of('Sales Performance')))
        .build();
    panel.classList.add('min-h-[400px]');

    const body = panel.querySelector('.panel-body');
    if (body) {
        const dataRelay$ = new Subject<Array<{ x: string; y: number }>>();
        const sub: Subscription = timer(0, 5000).pipe(
            map(() => [
                { x: 'Jan', y: 400 + Math.random() * 100 },
                { x: 'Feb', y: 300 + Math.random() * 100 },
                { x: 'Mar', y: 600 + Math.random() * 100 },
                { x: 'Apr', y: 800 + Math.random() * 100 },
                { x: 'May', y: 500 + Math.random() * 100 },
                { x: 'Jun', y: 700 + Math.random() * 100 }
            ])
        ).subscribe(data => dataRelay$.next(data));

        const chart = new ChartBuilder()
            .withData(dataRelay$)
        chart.addLineChart("x");

        body.appendChild(chart.build());

        const observer = new MutationObserver(() => {
            if (!document.body.contains(panel)) {
                sub.unsubscribe();
                dataRelay$.complete();
                observer.disconnect();
            }
        });
        requestAnimationFrame(() => {
            const parent = panel.parentElement ?? document.body;
            observer.observe(parent, { childList: true });
        });
    }

    return panel;
}

function createTransactionsGrid(): HTMLElement {
    const panel = new PanelBuilder()
        .withContent(new LabelBuilder().withCaption(of('Recent Transactions')))
        .build();
    panel.classList.add('min-h-[400px]');

    const body = panel.querySelector('.panel-body');
    if (body) {
        const data$ = of([
            { id: '1', customer: 'Alice Johnson', amount: 120.00, status: 'Completed', date: '2026-03-16' },
            { id: '2', customer: 'Bob Smith', amount: 85.50, status: 'Pending', date: '2026-03-15' },
            { id: '3', customer: 'Charlie Brown', amount: 240.00, status: 'Completed', date: '2026-03-15' },
            { id: '4', customer: 'Diana Prince', amount: 45.00, status: 'Cancelled', date: '2026-03-14' },
            { id: '5', customer: 'Ethan Hunt', amount: 320.00, status: 'Completed', date: '2026-03-14' }
        ]);

        const grid = new GridBuilder()
            .withItems(data$)
            const columns = grid.withColumns();
            
            columns.addTextColumn('customer').withHeader('Customer').withWidth('flex');
            columns.addNumberColumn('amount').withHeader('Amount').withWidth('100px');
            columns.addTextColumn('status').withHeader('Status').withWidth('120px');

        body.appendChild(grid.build());
    }

    return panel;
}
