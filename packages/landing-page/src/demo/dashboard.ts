import { LayoutBuilder, PanelBuilder, ChartBuilder, GridBuilder, LayoutGap, LabelBuilder } from 'aura-components';
import { of, timer, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { appState, AppView } from '../state/app-state';

export function createDashboardDemo(): HTMLElement {
    const layout = new LayoutBuilder()
        .asHorizontal()
        .withGap(LayoutGap.SMALL);

    // Sidebar
    const sidebar = createSidebar();
    layout.addSlot().withContent({build: () => sidebar});

    // Main Content Area
    const mainContent = document.createElement('div');
    mainContent.className = 'flex-1 flex flex-col h-screen overflow-hidden bg-background';

    // Dashboard Header
    const header = createDashboardHeader();
    mainContent.appendChild(header);

    // Dashboard Scrollable Body
    const body = document.createElement('div');
    body.className = 'flex-1 overflow-y-auto p-px-24';

    // Stats Grid
    const statsGrid = createStatsGrid();
    body.appendChild(statsGrid);

    // Charts & Grid Section
    const mainGrid = document.createElement('div');
    mainGrid.className = 'grid grid-cols-1 lg:grid-cols-2 gap-px-24 mt-px-24';

    mainGrid.appendChild(createSalesChart());
    mainGrid.appendChild(createTransactionsGrid());

    body.appendChild(mainGrid);
    mainContent.appendChild(body);

    layout.addSlot().withContent({build: () => mainContent});

    const element = layout.build();
    element.classList.add('h-screen', 'w-full');
    return element;
}

function createSidebar(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex flex-col h-full';
    container.style.cssText = 'background: var(--md-sys-color-surface-container-low); border-color: rgba(121,116,126,0.1);';

    // Logo area
    const logoArea = document.createElement('div');
    logoArea.className = 'px-px-16 py-px-16 border-b';
    logoArea.style.cssText = 'border-color: rgba(121,116,126,0.08);';
    logoArea.innerHTML = `
        <div class="flex items-center gap-px-12 cursor-pointer group" id="sidebar-logo">
            <div class="w-8 h-8 rounded-large flex items-center justify-center flex-shrink-0" style="background: linear-gradient(135deg, #6750A4, #7D5260);">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2L15.5 14H2.5L9 2Z" fill="white" fill-opacity="0.9"/>
                    <circle cx="9" cy="10" r="2.5" fill="white" fill-opacity="0.6"/>
                </svg>
            </div>
            <div class="flex flex-col">
                <span class="text-title-small font-semibold text-on-surface group-hover:text-primary transition-colors duration-200">Aura Dashboard</span>
                <span class="text-label-small text-on-surface-variant" style="opacity: 0.5;">v2.0 Demo</span>
            </div>
        </div>
    `;
    logoArea.querySelector('#sidebar-logo')?.addEventListener('click', () => {
        appState.setView(AppView.LANDING);
    });

    // Nav section
    const navSection = document.createElement('div');
    navSection.className = 'flex-1 overflow-y-auto p-px-12';

    const navLabel = document.createElement('div');
    navLabel.className = 'px-px-12 mb-px-8 mt-px-8 text-label-small font-semibold text-on-surface-variant uppercase tracking-widest';
    navLabel.style.cssText = 'opacity: 0.4; letter-spacing: 0.1em;';
    navLabel.textContent = 'Main Menu';
    navSection.appendChild(navLabel);

    const items = [
        {
            label: 'Overview',
            active: true,
            icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`
        },
        {
            label: 'Analytics',
            active: false,
            icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
        },
        {
            label: 'Customers',
            active: false,
            icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
        },
        {
            label: 'Orders',
            active: false,
            icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`
        },
        {
            label: 'Settings',
            active: false,
            icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`
        }
    ];

    items.forEach(item => {
        const btn = document.createElement('button');

        if (item.active) {
            btn.className = 'w-full flex items-center gap-px-12 px-px-12 py-px-8 rounded-large text-label-large mb-1 relative';
            btn.style.cssText = 'background: rgba(103,80,164,0.1); color: #6750A4;';

            // Active gradient accent bar
            const accent = document.createElement('span');
            accent.className = 'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full';
            accent.style.cssText = 'background: linear-gradient(180deg, #6750A4, #7D5260);';
            btn.appendChild(accent);
        } else {
            btn.className = 'w-full flex items-center gap-px-12 px-px-12 py-px-8 rounded-large text-label-large mb-1 text-on-surface-variant transition-colors duration-150 hover:bg-surface-variant-alpha-40';
        }

        btn.insertAdjacentHTML('beforeend', `${item.icon}<span>${item.label}</span>`);
        navSection.appendChild(btn);
    });

    // Footer
    const sidebarFooter = document.createElement('div');
    sidebarFooter.className = 'p-px-12 border-t';
    sidebarFooter.style.cssText = 'border-color: rgba(121,116,126,0.08);';

    const backBtn = document.createElement('button');
    backBtn.className = 'w-full flex items-center gap-px-12 px-px-12 py-px-8 rounded-large text-label-large text-on-surface-variant transition-colors duration-150 hover:bg-surface-variant-alpha-40';
    backBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Landing
    `;
    backBtn.onclick = () => appState.setView(AppView.LANDING);
    sidebarFooter.appendChild(backBtn);

    container.appendChild(logoArea);
    container.appendChild(navSection);
    container.appendChild(sidebarFooter);

    return container;
}

function createDashboardHeader(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'h-16 border-b px-px-24 flex items-center justify-between';
    header.style.cssText = 'background: rgba(254,247,255,0.8); backdrop-filter: blur(12px); border-color: rgba(121,116,126,0.08);';
    header.innerHTML = `
        <div class="flex items-center gap-px-16">
            <h2 class="text-title-large text-on-surface font-semibold">Overview</h2>
            <div class="flex items-center gap-px-8 px-px-12 py-px-4 rounded-full text-label-small" style="background: rgba(40,200,64,0.08); color: #16a34a; border: 1px solid rgba(40,200,64,0.15);">
                <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                Live data
            </div>
        </div>
        <div class="flex items-center gap-px-16">
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Search..." class="bg-surface-variant-alpha-30 border border-outline-alpha-10 rounded-full pl-px-32 pr-px-16 py-px-4 text-body-medium focus:outline-none focus:border-primary-alpha-40 transition-colors" style="width: 220px;">
            </div>
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-label-small font-semibold" style="background: linear-gradient(135deg, #6750A4, #7D5260);">N</div>
        </div>
    `;
    return header;
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
        // Use a Subject as a relay so we own the timer subscription and can cancel it.
        // ChartBuilder will subscribe to the Subject (which is itself an Observable),
        // but the underlying timer only runs while our sub is alive.
        const dataRelay$ = new Subject<Array<{ x: string; y: number }>>();

        const sub: Subscription = timer(0, 5000).pipe(
            map(() => [
                { x: 'Jan', y: 400 },
                { x: 'Feb', y: 300 },
                { x: 'Mar', y: 600 },
                { x: 'Apr', y: 800 },
                { x: 'May', y: 500 },
                { x: 'Jun', y: 700 }
            ])
        ).subscribe(data => dataRelay$.next(data));

        const chart = new ChartBuilder()
            .withData(dataRelay$)
        chart.addLineChart("x");

        body.appendChild(chart.build());

        // Stop the timer when the panel is removed from the DOM.
        // Defer setup so the panel is already mounted and has a parent to observe.
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
            { id: '1', customer: 'Alice Johnson', amount: '$120.00', status: 'Completed', date: '2026-03-16' },
            { id: '2', customer: 'Bob Smith', amount: '$85.50', status: 'Pending', date: '2026-03-15' },
            { id: '3', customer: 'Charlie Brown', amount: '$240.00', status: 'Completed', date: '2026-03-15' },
            { id: '4', customer: 'Diana Prince', amount: '$45.00', status: 'Cancelled', date: '2026-03-14' },
            { id: '5', customer: 'Ethan Hunt', amount: '$320.00', status: 'Completed', date: '2026-03-14' }
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
