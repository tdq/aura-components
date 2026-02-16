import { Observable, Subject } from 'rxjs';
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
    [ButtonStyle.FILLED]: 'bg-primary text-on-primary hover:shadow-level-1 focus:ring-primary',
    [ButtonStyle.ELEVATED]: 'bg-surface-container-low text-primary shadow-level-1 hover:shadow-level-2 focus:ring-primary',
    [ButtonStyle.TONAL]: 'bg-secondary-container text-on-secondary-container hover:shadow-level-1 focus:ring-secondary',
    [ButtonStyle.OUTLINED]: 'bg-transparent border border-outline text-primary hover:bg-primary/5 focus:ring-primary',
    [ButtonStyle.TEXT]: 'bg-transparent text-primary hover:bg-primary/5 focus:ring-primary',
};

export class ButtonBuilder implements ComponentBuilder {
    private caption$?: Observable<string>;
    private enabled$?: Observable<boolean>;
    private click$?: Subject<void>;
    private style$?: Observable<ButtonStyle>;
    private className$?: Observable<string>;

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
        button.className = cn(
            'px-px-24 py-px-10 rounded-extra-large font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-label-large'
        );

        // Default style if none provided
        STYLE_MAP[ButtonStyle.FILLED].split(' ').forEach(c => button.classList.add(c));

        const captionSub = this.caption$ ? this.caption$.subscribe(caption => {
            button.textContent = caption;
        }) : null;

        const enabledSub = this.enabled$ ? this.enabled$.subscribe(enabled => {
            button.disabled = !enabled;
        }) : null;

        const styleSub = this.style$ ? this.style$.subscribe(style => {
            // Remove existing style classes before adding new one
            Object.values(STYLE_MAP).forEach(cls => {
                cls.split(' ').forEach(c => button.classList.remove(c));
            });
            STYLE_MAP[style].split(' ').forEach(c => button.classList.add(c));
        }) : null;

        const classSub = this.className$ ? this.className$.subscribe(cls => {
            button.className = cn(
                'px-px-24 py-px-10 rounded-extra-large font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-label-large',
                cls
            );
            // Re-apply current style
            const currentStyle = Object.entries(STYLE_MAP).find(([_, classes]) =>
                classes.split(' ').every(c => button.classList.contains(c))
            )?.[0] as ButtonStyle || ButtonStyle.FILLED;
            STYLE_MAP[currentStyle].split(' ').forEach(c => button.classList.add(c));
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

