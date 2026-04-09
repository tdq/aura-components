import { router } from '../routes';
import {
    ChartBuilder,
    GridBuilder,
    FormBuilder,
    LabelBuilder,
    LabelSize,
    ButtonStyle,
    PanelBuilder,
    PanelGap,
    themeManager,
    registerDestroy
} from 'aura-components';
import { of, timer } from 'rxjs';
import { map } from 'rxjs/operators';

const themeStyles: Record<string, any> = {
    dark: {
        container: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
        blob1: 'bg-gradient-to-r from-blue-600/20 to-purple-600/20',
        blob2: 'bg-gradient-to-r from-purple-600/20 to-blue-600/20',
        title1: 'bg-gradient-to-r from-white via-blue-100 to-purple-200',
        title2: 'bg-gradient-to-r from-blue-400 to-purple-400',
        description: 'text-gray-300',
        stats: 'text-sky-100',
        installBtn: 'border-white/20 bg-white/10 text-white hover:bg-white/20',
        badge: 'background: rgba(103, 80, 164, 0.9); border: 1px solid rgba(103, 80, 164, 0.9); color: rgb(255, 255, 255);'
    },
    light: {
        container: 'bg-gradient-to-br from-white via-sky-50 to-sky-100',
        blob1: 'bg-gradient-to-r from-sky-400/20 to-blue-400/20',
        blob2: 'bg-gradient-to-r from-blue-400/20 to-sky-400/20',
        title1: 'bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900',
        title2: 'bg-gradient-to-r from-blue-600 to-sky-600',
        description: 'text-slate-600',
        stats: 'text-slate-900',
        installBtn: 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100',
        badge: 'background: rgba(15, 82, 186, 0.1); border: 1px solid rgba(15, 82, 186, 0.2); color: rgb(15, 82, 186);'
    },
    pink: {
        container: 'bg-gradient-to-br from-white via-pink-50 to-pink-100',
        blob1: 'bg-gradient-to-r from-pink-400/20 to-rose-400/20',
        blob2: 'bg-gradient-to-r from-rose-400/20 to-pink-400/20',
        title1: 'bg-gradient-to-r from-slate-900 via-pink-800 to-slate-900',
        title2: 'bg-gradient-to-r from-pink-600 to-rose-600',
        description: 'text-slate-600',
        stats: 'text-slate-900',
        installBtn: 'border-pink-200 bg-pink-50 text-slate-900 hover:bg-pink-100',
        badge: 'background: rgba(255, 179, 209, 0.2); border: 1px solid rgba(255, 179, 209, 0.3); color: rgb(125, 41, 80);'
    }
};

export function createHero(): HTMLElement {
    const section = document.createElement('section');

    section.innerHTML = `
        <div id="hero-container" class="min-h-screen relative overflow-hidden transition-colors duration-500">
            <div class="absolute inset-0">
                <div id="hero-blob-1"
                    class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700">
                </div>
                <div id="hero-blob-2"
                    class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700">
                </div>
            </div>
            <div class="relative z-10 container mx-auto px-4 py-20">
                <div class="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
                    <div class="space-y-8">
                        <div class="space-y-6">
                            <div id="hero-badge" class="inline-flex items-center gap-px-8 px-px-16 py-px-8 rounded-full text-label-medium mb-px-32 transition-all duration-500">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                                <span>RxJS native · TypeScript · Material 3</span>
                            </div>
                            <h1 class="text-5xl md:text-7xl font-bold leading-tight">
                                <span id="hero-title-1"
                                    class="bg-clip-text text-transparent transition-all duration-500">Components
                                    That</span><br /><span id="hero-title-2"
                                    class="bg-clip-text text-transparent transition-all duration-500">Take
                                    Observables</span>
                            </h1>
                            <p id="hero-description" class="text-xl max-w-lg leading-relaxed transition-colors duration-500">
                                Pass an RxJS stream to any prop. No framework, no Shadow DOM, no wrappers — your
                                observable in, reactive DOM out.
                            </p>
                        </div>
                        <div id="hero-stats" class="mt-px-32 flex items-center gap-0 transition-colors duration-500">
                            <div class="flex flex-col items-start pr-px-24">
                                <span class="text-title-medium font-bold text-on-surface stats-label transition-colors duration-500">Zero</span>
                                <span class="text-label-small text-on-surface-variant mt-px-2 stats-sublabel transition-colors duration-500"
                                    style="opacity: 0.6;">runtime deps</span>
                            </div>
                            <div class="w-px h-8 bg-outline opacity-15"></div>
                            <div class="flex flex-col items-start px-px-24">
                                <span class="text-title-medium font-bold text-on-surface stats-label transition-colors duration-500">~45kb</span>
                                <span class="text-label-small text-on-surface-variant mt-px-2 stats-sublabel transition-colors duration-500"
                                    style="opacity: 0.6;">gzipped</span>
                            </div>
                            <div class="w-px h-8 bg-outline opacity-15"></div>
                            <div class="flex flex-col items-start pl-px-24">
                                <span class="text-title-medium font-bold text-on-surface stats-label transition-colors duration-500">100%</span>
                                <span class="text-label-small text-on-surface-variant mt-px-2 stats-sublabel transition-colors duration-500"
                                    style="opacity: 0.6;">TypeScript</span>
                            </div>
                        </div>
                        <div class="flex flex-row gap-4">
                            <button
                                id="explore-dashboard-btn"
                                class="ring-offset-background focus-visible:outline-hidden focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-primary/90 h-11 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg font-semibold group">
                                Explore Live Dashboard<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-arrow-right ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform">
                                    <path d="M5 12h14"></path>
                                    <path d="m12 5 7 7-7 7"></path>
                                </svg></button><button
                                id="install-btn"
                                class="ring-offset-background focus-visible:outline-hidden focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-11 rounded-md backdrop-blur-md px-8 py-6 text-lg">
                                Install in 60 seconds
                            </button>
                        </div>
                    </div>
                    <div class="relative transform rotate-2">
                        <div class="grid grid-cols-2 gap-6" id="hero-visual-grid">
                            <!-- Interactive components will be injected here -->
                        </div>
                        <div id="hero-blob-3"
                            class="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-xl transition-all duration-700">
                        </div>
                        <div id="hero-blob-4"
                            class="absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-xl transition-all duration-700">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const sub = themeManager.theme$.pipe(
        map(theme => {
            if (theme === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return theme;
        })
    ).subscribe(theme => {
        const styles = themeStyles[theme] || themeStyles.dark;
        
        const container = section.querySelector('#hero-container') as HTMLElement;
        const blob1 = section.querySelector('#hero-blob-1') as HTMLElement;
        const blob2 = section.querySelector('#hero-blob-2') as HTMLElement;
        const blob3 = section.querySelector('#hero-blob-3') as HTMLElement;
        const blob4 = section.querySelector('#hero-blob-4') as HTMLElement;
        const title1 = section.querySelector('#hero-title-1') as HTMLElement;
        const title2 = section.querySelector('#hero-title-2') as HTMLElement;
        const description = section.querySelector('#hero-description') as HTMLElement;
        const installBtn = section.querySelector('#install-btn') as HTMLElement;
        const badge = section.querySelector('#hero-badge') as HTMLElement;
        const statsLabels = section.querySelectorAll('.stats-label');
        const statsSublabels = section.querySelectorAll('.stats-sublabel');

        if (container) container.className = `min-h-screen relative overflow-hidden transition-colors duration-500 ${styles.container}`;
        if (blob1) blob1.className = `absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ${styles.blob1}`;
        if (blob2) blob2.className = `absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700 ${styles.blob2}`;
        if (blob3) blob3.className = `absolute -top-4 -right-4 w-20 h-20 rounded-full blur-xl transition-all duration-700 ${styles.blob1}`;
        if (blob4) blob4.className = `absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-xl transition-all duration-700 ${styles.blob2}`;
        if (title1) title1.className = `bg-clip-text text-transparent transition-all duration-500 ${styles.title1}`;
        if (title2) title2.className = `bg-clip-text text-transparent transition-all duration-500 ${styles.title2}`;
        if (description) description.className = `text-xl max-w-lg leading-relaxed transition-colors duration-500 ${styles.description}`;
        if (installBtn) installBtn.className = `ring-offset-background focus-visible:outline-hidden focus-visible:ring-ring inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-11 rounded-md backdrop-blur-md px-8 py-6 text-lg ${styles.installBtn}`;
        if (badge) badge.setAttribute('style', styles.badge);
        
        statsLabels.forEach(el => {
            el.className = `text-title-medium font-bold stats-label transition-colors duration-500 ${styles.stats}`;
        });
        statsSublabels.forEach(el => {
            el.className = `text-label-small mt-px-2 stats-sublabel transition-colors duration-500 ${styles.stats}`;
            (el as HTMLElement).style.opacity = theme === 'dark' ? '0.6' : '0.7';
        });
    });

    registerDestroy(section, () => sub.unsubscribe());

    const visualGrid = section.querySelector('#hero-visual-grid')!;


    // 1. Interactive Chart (Line chart with live data)
    const chartCard = new PanelBuilder()
        .withClass(of('col-span-2'))
        .asGlass();
    const chartData$ = of(Array.from({ length: 10 }, (_, i) => ({
        time: i,
        value: Math.floor(Math.random() * 100) + 50
    })))
    const chart = new ChartBuilder()
        .withData(chartData$)
        .withHeight(160);
    chart.addLineChart('value').withColor('#10b981');
    chartCard.withContent(chart);
    visualGrid.appendChild(chartCard.build());

    // 2. Interactive Form (Small subscribe form)
    const formCard = new PanelBuilder()
        .asGlass();
    const form = new FormBuilder()
        .asGlass()
        .withCaption(of('Stay Updated'));
    const fields = form.withFields();
    fields.addTextField().withLabel(of('Email')).withPlaceholder(of('Enter your email...'));
    const toolbar = form.withToolbar();
    toolbar.withPrimaryButton().withCaption(of('Subscribe')).withStyle(of(ButtonStyle.FILLED));

    formCard.withContent(form);
    visualGrid.appendChild(formCard.build());

    // 3. Interactive Grid (Transaction history)
    const gridData$ = of([
        { id: 1, type: 'Income', amount: 1200 },
        { id: 2, type: 'Expense', amount: 450 },
        { id: 3, type: 'Income', amount: 800 },
        { id: 4, type: 'Expense', amount: 120 }
    ]);
    const grid = new GridBuilder()
        .withItems(gridData$)
        .asGlass();
    const cols = grid.withColumns();
    cols.addTextColumn('type').withHeader('Type').withWidth('flex');
    cols.addNumberColumn('amount').withHeader('Amount');

    visualGrid.appendChild(grid.build());

    // Add event listeners
    const exploreBtn = section.querySelector('#explore-dashboard-btn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => router.navigate('/dashboard'));
    }

    const installBtn = section.querySelector('#install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    return section;
}
