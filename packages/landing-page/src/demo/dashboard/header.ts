import { router } from '../../routes';
import { map } from 'rxjs/operators';

export function createDashboardHeader(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'h-16 border-b px-px-24 flex items-center justify-between flex-shrink-0';
    header.style.cssText = 'background: rgba(254,247,255,0.8); backdrop-filter: blur(12px); border-color: rgba(121,116,126,0.08);';

    const title$ = router.currentRoute$.pipe(
        map(route => {
            const page = route?.params?.page;
            if (!page) return 'Overview';
            return page.charAt(0).toUpperCase() + page.slice(1);
        })
    );

    const titleEl = document.createElement('h2');
    titleEl.className = 'text-title-large text-on-surface font-semibold';
    title$.subscribe(t => titleEl.textContent = t);

    header.innerHTML = `
        <div class="flex items-center gap-px-16" id="header-title-container">
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

    header.querySelector('#header-title-container')?.prepend(titleEl);

    return header;
}
