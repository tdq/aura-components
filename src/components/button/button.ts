import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { ComponentBuilder } from '../../core/component-builder';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { registerDestroy } from '@/core/destroyable-element';

export enum ButtonStyle {
    FILLED = 'filled',
    ELEVATED = 'elevated',
    TONAL = 'tonal',
    OUTLINED = 'outlined',
    TEXT = 'text'
}

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const STYLE_MAP: Record<ButtonStyle, string> = {
    [ButtonStyle.FILLED]: 'bg-primary text-on-primary hover:elevation-1 focus:ring-primary shadow-sm',
    [ButtonStyle.ELEVATED]: 'bg-surface text-primary elevation-1 hover:elevation-2 focus:ring-primary',
    [ButtonStyle.TONAL]: 'bg-secondary-container text-on-secondary-container hover:elevation-1 focus:ring-secondary',
    [ButtonStyle.OUTLINED]: 'bg-transparent border border-outline text-primary hover:bg-primary/5 focus:ring-primary',
    [ButtonStyle.TEXT]: 'bg-transparent text-primary hover:bg-primary/5 focus:ring-primary',
};

export class ButtonBuilder implements ComponentBuilder {
    private caption$?: Observable<string>;
    private enabled$?: Observable<boolean>;
    private click$?: Subject<void>;
    private style$?: Observable<ButtonStyle>;
    private className$?: Observable<string>;
    private isGlass$ = new BehaviorSubject<boolean>(false);

    asGlass(): ButtonBuilder {
        this.isGlass$.next(true);
        return this;
    }

    withCaption(caption: Observable<string>): ButtonBuilder {
        this.caption$ = caption;
        return this;
    }

    withEnabled(enabled: Observable<boolean>): ButtonBuilder {
        this.enabled$ = enabled;
        return this;
    }

    withClick(click: Subject<void>): ButtonBuilder {
        this.click$ = click;
        return this;
    }

    withStyle(style: Observable<ButtonStyle>): ButtonBuilder {
        this.style$ = style;
        return this;
    }

    withClass(className: Observable<string>): ButtonBuilder {
        this.className$ = className;
        return this;
    }

    build(): HTMLButtonElement {
        const button = document.createElement('button');
        const BASE_CLASSES = 'px-px-24 py-px-12 rounded-small font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-label-large inline-flex items-center justify-center gap-2';

        button.className = cn(BASE_CLASSES);

        // Default style if none provided
        STYLE_MAP[ButtonStyle.FILLED].split(' ').forEach(c => button.classList.add(c));

        const captionSub = this.caption$ ? this.caption$.subscribe(caption => {
            button.textContent = caption;
        }) : null;

        const enabledSub = this.enabled$ ? this.enabled$.subscribe(enabled => {
            button.disabled = !enabled;
        }) : null;

        const style$ = this.style$ || new BehaviorSubject<ButtonStyle>(ButtonStyle.FILLED);
        const styleSub = combineLatest([style$, this.isGlass$]).subscribe(([style, isGlass]) => {
            // Remove existing style classes before adding new one
            Object.values(STYLE_MAP).forEach(cls => {
                cls.split(' ').forEach(c => button.classList.remove(c));
            });

            // Remove glass classes
            const glassClasses = ['bg-white/10', 'backdrop-blur-md', 'border', 'border-white/20', 'hover:bg-white/20'];
            glassClasses.forEach(c => button.classList.remove(c));

            if (isGlass) {
                // Apply glass effect
                button.classList.add('bg-white/10', 'backdrop-blur-md', 'border', 'border-white/20', 'hover:bg-white/20');
                // Keep the text color and focus ring from the original style if possible
                const originalClasses = STYLE_MAP[style].split(' ');
                originalClasses.forEach(c => {
                    if (c.startsWith('text-') || c.startsWith('focus:ring-')) {
                        button.classList.add(c);
                    }
                });
            } else {
                STYLE_MAP[style].split(' ').forEach(c => button.classList.add(c));
            }
        });

        const classSub = this.className$ ? this.className$.subscribe(cls => {
            button.className = cn(BASE_CLASSES, cls);

            // Re-apply style and glass classes
            const isGlass = this.isGlass$.value;
            // Get current style from style$ if possible, otherwise find applied
            let style = ButtonStyle.FILLED;
            if (this.style$ && (this.style$ as any).value) {
                style = (this.style$ as any).value;
            } else {
                // Heuristic to find applied style
                style = (Object.entries(STYLE_MAP).find(([_, classes]) =>
                    classes.split(' ').every(c => button.classList.contains(c))
                )?.[0] as ButtonStyle) || ButtonStyle.FILLED;
            }

            if (isGlass) {
                button.classList.add('bg-white/10', 'backdrop-blur-md', 'border', 'border-white/20', 'hover:bg-white/20');
                const originalClasses = STYLE_MAP[style].split(' ');
                originalClasses.forEach(c => {
                    if (c.startsWith('text-') || c.startsWith('focus:ring-')) {
                        button.classList.add(c);
                    }
                });
            } else {
                STYLE_MAP[style].split(' ').forEach(c => button.classList.add(c));
            }
        }) : null;

        if (this.click$) {
            button.onclick = () => {
                this.click$?.next(undefined);
            };
        }

        registerDestroy(button, () => {
            captionSub?.unsubscribe();
            enabledSub?.unsubscribe();
            styleSub?.unsubscribe();
            classSub?.unsubscribe();
            this.click$?.complete();
        });

        return button;
    }
}

