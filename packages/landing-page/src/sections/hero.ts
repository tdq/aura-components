import { ButtonBuilder, ButtonStyle } from 'aura-components';
import { of, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { appState, AppView } from '../state/app-state';

export function createHero(): HTMLElement {
    const section = document.createElement('section');
    section.className = 'relative min-h-screen flex flex-col justify-center px-px-24 overflow-hidden';

    // Subtle dot-grid background instead of floating blobs
    const bgLayer = document.createElement('div');
    bgLayer.className = 'absolute inset-0 -z-10';
    bgLayer.innerHTML = `
        <div class="absolute inset-0" style="background-image: radial-gradient(circle, rgba(103,80,164,0.08) 1px, transparent 1px); background-size: 32px 32px; opacity: 0.6;"></div>
        <div class="absolute inset-0" style="background: radial-gradient(ellipse 80% 60% at 70% 50%, rgba(103,80,164,0.05) 0%, transparent 70%);"></div>
        <div class="absolute inset-0" style="background: radial-gradient(ellipse 50% 80% at 0% 50%, var(--md-sys-color-surface) 0%, transparent 60%);"></div>
    `;
    section.appendChild(bgLayer);

    // Two-column layout
    const inner = document.createElement('div');
    inner.className = 'max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-px-48 items-center py-px-96 pt-[120px]';

    // LEFT: copy
    const left = document.createElement('div');
    left.className = 'flex flex-col items-start';

    // Badge
    const badge = document.createElement('div');
    badge.className = 'inline-flex items-center gap-px-8 px-px-16 py-px-8 rounded-full text-label-medium mb-px-32 animate-fade-in';
    badge.style.cssText = 'background: rgba(103,80,164,0.08); border: 1px solid rgba(103,80,164,0.2); color: #6750A4;';
    badge.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span>RxJS native &middot; TypeScript &middot; Material 3</span>
    `;
    left.appendChild(badge);

    // Headline
    const title = document.createElement('h1');
    title.className = 'text-[56px] md:text-[72px] font-bold leading-[1.05] tracking-tight text-on-surface animate-fade-in';
    title.style.cssText = 'letter-spacing: -0.03em;';
    title.innerHTML = `Components That<br><span style="background: linear-gradient(135deg, #6750A4 0%, #625B71 50%, #7D5260 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Take Observables.</span>`;
    left.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'mt-px-24 text-on-surface-variant max-w-lg leading-relaxed animate-fade-in-delay';
    subtitle.style.cssText = 'opacity: 0.8; font-size: 18px; line-height: 1.7;';
    subtitle.textContent = 'Pass an RxJS stream to any prop. No framework, no Shadow DOM, no wrappers — your observable in, reactive DOM out.';
    left.appendChild(subtitle);

    // Stats row
    const stats = document.createElement('div');
    stats.className = 'mt-px-32 flex items-center gap-0 animate-fade-in-delay';
    stats.innerHTML = `
        <div class="flex flex-col items-start pr-px-24">
            <span class="text-title-medium font-bold text-on-surface">Zero</span>
            <span class="text-label-small text-on-surface-variant mt-px-2" style="opacity: 0.6;">runtime deps</span>
        </div>
        <div class="w-px h-8 bg-outline opacity-15"></div>
        <div class="flex flex-col items-start px-px-24">
            <span class="text-title-medium font-bold text-on-surface">~45kb</span>
            <span class="text-label-small text-on-surface-variant mt-px-2" style="opacity: 0.6;">gzipped</span>
        </div>
        <div class="w-px h-8 bg-outline opacity-15"></div>
        <div class="flex flex-col items-start pl-px-24">
            <span class="text-title-medium font-bold text-on-surface">100%</span>
            <span class="text-label-small text-on-surface-variant mt-px-2" style="opacity: 0.6;">TypeScript</span>
        </div>
    `;
    left.appendChild(stats);

    // CTA buttons
    const actions = document.createElement('div');
    actions.className = 'mt-px-40 flex flex-wrap gap-px-16 animate-fade-in-delay';

    const dashboardBtn = document.createElement('button');
    dashboardBtn.className = 'px-px-32 py-px-16 text-label-large font-semibold text-white rounded-extra-large transition-all duration-200 hover:scale-105 active:scale-95';
    dashboardBtn.style.cssText = 'background: linear-gradient(135deg, #6750A4, #7D5260); box-shadow: 0 4px 20px rgba(103, 80, 164, 0.35);';
    dashboardBtn.innerHTML = `
        <span class="flex items-center gap-px-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Explore Live Dashboard
        </span>
    `;
    dashboardBtn.onmouseenter = () => {
        dashboardBtn.style.cssText = 'background: linear-gradient(135deg, #6750A4, #7D5260); box-shadow: 0 8px 30px rgba(103, 80, 164, 0.5); transform: scale(1.05);';
    };
    dashboardBtn.onmouseleave = () => {
        dashboardBtn.style.cssText = 'background: linear-gradient(135deg, #6750A4, #7D5260); box-shadow: 0 4px 20px rgba(103, 80, 164, 0.35); transform: scale(1);';
    };
    dashboardBtn.onclick = () => appState.setView(AppView.DASHBOARD);

    const installBtn = document.createElement('button');
    installBtn.className = 'px-px-32 py-px-16 text-label-large font-semibold text-on-surface rounded-extra-large transition-all duration-200 hover:scale-105 active:scale-95';
    installBtn.style.cssText = 'background: transparent; border: 1.5px solid rgba(103, 80, 164, 0.3);';
    installBtn.innerHTML = `
        <span class="flex items-center gap-px-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/></svg>
            Install in 60 seconds
        </span>
    `;
    installBtn.onmouseenter = () => {
        installBtn.style.cssText = 'background: rgba(103, 80, 164, 0.06); border: 1.5px solid rgba(103, 80, 164, 0.5); box-shadow: 0 0 20px rgba(103, 80, 164, 0.1); transform: scale(1.05);';
    };
    installBtn.onmouseleave = () => {
        installBtn.style.cssText = 'background: transparent; border: 1.5px solid rgba(103, 80, 164, 0.3); transform: scale(1);';
    };
    installBtn.onclick = () => {
        document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' });
    };

    actions.appendChild(dashboardBtn);
    actions.appendChild(installBtn);
    left.appendChild(actions);

    // RIGHT: hero visual
    const right = document.createElement('div');
    right.className = 'hidden lg:flex flex-col gap-px-12 animate-fade-in-delay';
    right.appendChild(createHeroVisual());

    inner.appendChild(left);
    inner.appendChild(right);
    section.appendChild(inner);

    return section;
}

function createHeroVisual(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'flex flex-col gap-px-12';

    // Terminal card showing the code
    const terminal = document.createElement('div');
    terminal.className = 'rounded-extra-large overflow-hidden';
    terminal.style.cssText = 'background: #1a1625; box-shadow: 0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06);';
    terminal.innerHTML = `
        <div class="flex items-center gap-px-8 px-px-20 py-px-14 border-b" style="border-color: rgba(255,255,255,0.06);">
            <span class="w-3 h-3 rounded-full" style="background: #ff5f57;"></span>
            <span class="w-3 h-3 rounded-full" style="background: #febc2e;"></span>
            <span class="w-3 h-3 rounded-full" style="background: #28c840;"></span>
            <span class="ml-px-8 text-label-small" style="color: rgba(255,255,255,0.35); font-size: 11px;">component-demo.ts</span>
        </div>
        <div class="p-px-24 overflow-x-auto" style="font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.8;">
            <pre style="margin:0; color: rgba(255,255,255,0.85);"><code><span style="color: #a78bfa;">import</span> <span style="color: #e2e8f0;">{ <span style="color: #93c5fd;">ButtonBuilder</span>, <span style="color: #93c5fd;">ButtonStyle</span> }</span>
  <span style="color: #a78bfa;">from</span> <span style="color: #fbbf24;">'aura-components'</span><span style="color: #e2e8f0;">;</span>
<span style="color: #a78bfa;">import</span> <span style="color: #e2e8f0;">{ <span style="color: #93c5fd;">interval</span> }</span> <span style="color: #a78bfa;">from</span> <span style="color: #fbbf24;">'rxjs'</span><span style="color: #e2e8f0;">;</span>
<span style="color: #a78bfa;">import</span> <span style="color: #e2e8f0;">{ <span style="color: #93c5fd;">map</span> }</span> <span style="color: #a78bfa;">from</span> <span style="color: #fbbf24;">'rxjs/operators'</span><span style="color: #e2e8f0;">;</span>

<span style="color: rgba(255,255,255,0.3);">// Style cycles automatically — no code needed.</span>
<span style="color: #a78bfa;">const</span> <span style="color: #34d399;">style$</span> <span style="color: #e2e8f0;">=</span> <span style="color: #34d399;">interval</span><span style="color: #e2e8f0;">(1500).</span><span style="color: #34d399;">pipe</span><span style="color: #e2e8f0;">(</span>
  <span style="color: #34d399;">map</span><span style="color: #e2e8f0;">(</span><span style="color: #a78bfa;">n</span> <span style="color: #e2e8f0;">=></span> <span style="color: #34d399;">STYLES</span><span style="color: #e2e8f0;">[</span><span style="color: #a78bfa;">n</span> <span style="color: #e2e8f0;">%</span> <span style="color: #fbbf24;">4</span><span style="color: #e2e8f0;">])</span>
<span style="color: #e2e8f0;">);</span>

<span style="color: #a78bfa;">new</span> <span style="color: #93c5fd;">ButtonBuilder</span><span style="color: #e2e8f0;">()</span>
  <span style="color: #e2e8f0;">.</span><span style="color: #34d399;">withCaption</span><span style="color: #e2e8f0;">(</span><span style="color: #34d399;">of</span><span style="color: #e2e8f0;">(</span><span style="color: #fbbf24;">'Aura Components'</span><span style="color: #e2e8f0;">))</span>
  <span style="color: #e2e8f0;">.</span><span style="color: #34d399;">withStyle</span><span style="color: #e2e8f0;">(</span><span style="color: #34d399;">style$</span><span style="color: #e2e8f0;">)</span>
  <span style="color: #e2e8f0;">.</span><span style="color: #34d399;">build</span><span style="color: #e2e8f0;">();</span></code></pre>
        </div>
    `;
    wrap.appendChild(terminal);

    // Live preview card with actual rendered components
    const preview = document.createElement('div');
    preview.className = 'rounded-extra-large px-px-24 py-px-20 border';
    preview.style.cssText = 'background: var(--md-sys-color-surface); border-color: rgba(121, 116, 126, 0.12); box-shadow: 0 4px 20px rgba(0,0,0,0.04);';

    const previewHeader = document.createElement('div');
    previewHeader.className = 'flex items-center justify-between mb-px-16';
    previewHeader.innerHTML = `
        <div class="flex items-center gap-px-8">
            <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: #28c840;"></span>
            <span class="text-label-small text-on-surface-variant" style="opacity: 0.6; font-size: 11px; font-family: 'Fira Code', monospace;">Live Preview</span>
        </div>
        <span class="text-label-small text-on-surface-variant" style="opacity: 0.4; font-size: 11px;">style$ cycling every 1.5s</span>
    `;

    const previewContent = document.createElement('div');
    previewContent.className = 'flex gap-px-12 items-center flex-wrap';

    // Render the live cycling button
    const STYLES = [ButtonStyle.FILLED, ButtonStyle.OUTLINED, ButtonStyle.TONAL, ButtonStyle.TEXT];
    const style$ = interval(1500).pipe(map(n => STYLES[n % 4]));
    const liveBtn = new ButtonBuilder()
        .withCaption(of('Aura Components'))
        .withStyle(style$)
        .build();
    previewContent.appendChild(liveBtn);

    // Also render a static row of all 4 styles for reference
    const styleRow = document.createElement('div');
    styleRow.className = 'flex gap-px-8 items-center mt-px-12 pt-px-12 border-t w-full flex-wrap';
    styleRow.style.cssText = 'border-color: rgba(121,116,126,0.08);';

    const styleLabel = document.createElement('span');
    styleLabel.className = 'text-label-small text-on-surface-variant w-full mb-px-8';
    styleLabel.style.cssText = 'opacity: 0.45; font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.08em;';
    styleLabel.textContent = 'All 4 variants';
    styleRow.appendChild(styleLabel);

    STYLES.forEach(style => {
        const btn = new ButtonBuilder()
            .withCaption(of(['Filled', 'Outlined', 'Tonal', 'Text'][STYLES.indexOf(style)]))
            .withStyle(of(style))
            .build();
        btn.style.transform = 'scale(0.85)';
        btn.style.transformOrigin = 'left center';
        styleRow.appendChild(btn);
    });

    preview.appendChild(previewHeader);
    preview.appendChild(previewContent);
    preview.appendChild(styleRow);
    wrap.appendChild(preview);

    return wrap;
}
