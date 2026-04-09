import { PanelBuilder, ChartBuilder, LabelBuilder } from 'aura-components';
import { of } from 'rxjs';

export function createAnalytics(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex-1 overflow-y-auto p-px-24';

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 lg:grid-cols-2 gap-px-24';

    grid.appendChild(createRevenueChart());
    grid.appendChild(createUsersChart());
    grid.appendChild(createDeviceChart());
    grid.appendChild(createRegionalChart());

    container.appendChild(grid);

    return container;
}

function createRevenueChart(): HTMLElement {
    const panel = new PanelBuilder()
        .withContent(new LabelBuilder().withCaption(of('Revenue Growth')))
        .build();
    panel.classList.add('min-h-[350px]');

    const body = panel.querySelector('.panel-body');
    if (body) {
        const data$ = of([
            { x: 'Mon', y: 1200 },
            { x: 'Tue', y: 1900 },
            { x: 'Wed', y: 1500 },
            { x: 'Thu', y: 2200 },
            { x: 'Fri', y: 2800 },
            { x: 'Sat', y: 2400 },
            { x: 'Sun', y: 2100 }
        ]);

        const chart = new ChartBuilder().withData(data$);
        chart.addLineChart("x");
        body.appendChild(chart.build());
    }
    return panel;
}

function createUsersChart(): HTMLElement {
    const panel = new PanelBuilder()
        .withContent(new LabelBuilder().withCaption(of('Active Users')))
        .build();
    panel.classList.add('min-h-[350px]');

    const body = panel.querySelector('.panel-body');
    if (body) {
        const data$ = of([
            { x: 'Mon', y: 400 },
            { x: 'Tue', y: 500 },
            { x: 'Wed', y: 450 },
            { x: 'Thu', y: 600 },
            { x: 'Fri', y: 700 },
            { x: 'Sat', y: 850 },
            { x: 'Sun', y: 750 }
        ]);

        const chart = new ChartBuilder().withData(data$);
        chart.addBarChart("x");
        body.appendChild(chart.build());
    }
    return panel;
}

function createDeviceChart(): HTMLElement {
    const panel = new PanelBuilder()
        .withContent(new LabelBuilder().withCaption(of('Traffic by Device')))
        .build();
    panel.classList.add('min-h-[350px]');

    const body = panel.querySelector('.panel-body');
    if (body) {
        const data$ = of([
            { x: 'Desktop', y: 45 },
            { x: 'Mobile', y: 35 },
            { x: 'Tablet', y: 15 },
            { x: 'Other', y: 5 }
        ]);

        const chart = new ChartBuilder().withData(data$);
        chart.addBarChart("x");
        body.appendChild(chart.build());
    }
    return panel;
}

function createRegionalChart(): HTMLElement {
    const panel = new PanelBuilder()
        .withContent(new LabelBuilder().withCaption(of('Regional Sales')))
        .build();
    panel.classList.add('min-h-[350px]');

    const body = panel.querySelector('.panel-body');
    if (body) {
        const data$ = of([
            { x: 'North America', y: 4500 },
            { x: 'Europe', y: 3200 },
            { x: 'Asia', y: 2800 },
            { x: 'Latin America', y: 1200 },
            { x: 'Middle East', y: 800 }
        ]);

        const chart = new ChartBuilder().withData(data$);
        chart.addBarChart("x");
        body.appendChild(chart.build());
    }
    return panel;
}
