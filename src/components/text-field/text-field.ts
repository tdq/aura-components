import { Observable, Subject, combineLatest, of, fromEvent, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ComponentBuilder } from '../../core/component-builder';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { registerDestroy } from '@/core/destroyable-element';

export enum TextFieldStyle {
    TONAL = 'tonal',
    OUTLINED = 'outlined'
}

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

let nextId = 0;
const generateId = () => `text-field-${nextId++}`;

const STYLE_MAP: Record<TextFieldStyle, string> = {
    [TextFieldStyle.TONAL]: 'bg-surface-variant rounded-t-small outline outline-1 -outline-offset-1 outline-outline-variant focus:outline-2 focus:outline-primary',
    [TextFieldStyle.OUTLINED]: 'bg-transparent rounded-small outline outline-1 -outline-offset-1 outline-outline focus:outline-2 focus:outline-primary',
};

export class TextFieldBuilder implements ComponentBuilder {
    private value$?: Subject<string>;
    private placeholder$ = of('');
    private enabled$ = of(true);
    private style$ = of(TextFieldStyle.TONAL);
    private error$ = of('');
    private internalError$ = new BehaviorSubject<string>('');
    private validators: ((value: string) => string | null)[] = [];
    private label$ = of('');
    private className$ = of('');
    private isGlass: boolean = false;
    private type$ = of('text');
    private name$ = of('');
    private required$ = of(false);
    private readOnly$ = of(false);
    private autocomplete$ = of('off');

    private focusSubject = new Subject<FocusEvent>();
    private blurSubject = new Subject<FocusEvent>();
    private changeSubject = new Subject<Event>();

    asGlass(isGlass: boolean = true): TextFieldBuilder {
        this.isGlass = isGlass;
        return this;
    }

    asPassword(): TextFieldBuilder {
        this.type$ = of('password');
        return this;
    }

    asEmail(): TextFieldBuilder {
        this.type$ = of('email');
        return this;
    }

    withValidator(validator: (value: string) => string | null): TextFieldBuilder {
        this.validators.push(validator);
        return this;
    }

    withEmailValidation(message: string = 'Invalid email address'): TextFieldBuilder {
        return this.withValidator((value: string) => {
            if (!value) return null;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? null : message;
        });
    }

    withName(name: string): TextFieldBuilder {
        this.name$ = of(name);
        return this;
    }

    withRequired(required: Observable<boolean> = of(true)): TextFieldBuilder {
        this.required$ = required;
        return this;
    }

    withReadOnly(readOnly: Observable<boolean> = of(true)): TextFieldBuilder {
        this.readOnly$ = readOnly;
        return this;
    }

    withAutocomplete(autocomplete: string): TextFieldBuilder {
        this.autocomplete$ = of(autocomplete);
        return this;
    }

    withValue(value: Subject<string>): TextFieldBuilder {
        this.value$ = value;
        return this;
    }

    withPlaceholder(placeholder: Observable<string>): TextFieldBuilder {
        this.placeholder$ = placeholder;
        return this;
    }

    withEnabled(enabled: Observable<boolean>): TextFieldBuilder {
        this.enabled$ = enabled;
        return this;
    }

    withStyle(style: Observable<TextFieldStyle>): TextFieldBuilder {
        this.style$ = style;
        return this;
    }

    withError(error: Observable<string>): TextFieldBuilder {
        this.error$ = error;
        return this;
    }

    withLabel(label: Observable<string>): TextFieldBuilder {
        this.label$ = label;
        return this;
    }

    withClass(className: Observable<string>): TextFieldBuilder {
        this.className$ = className;
        return this;
    }

    onFocus(): Observable<FocusEvent> {
        return this.focusSubject.asObservable();
    }

    onBlur(): Observable<FocusEvent> {
        return this.blurSubject.asObservable();
    }

    onChange(): Observable<Event> {
        return this.changeSubject.asObservable();
    }

    private getValidationClasses(error: string): string {
        if (!error) return '';
        return 'outline-error focus:outline-error';
    }

    build(): HTMLElement {
        const id = generateId();
        const errorId = `${id}-error`;

        const container = document.createElement('div');
        container.className = 'flex flex-col gap-1 w-full';

        const label = document.createElement('label');
        label.htmlFor = id;
        label.className = 'md-label-small text-on-surface-variant px-4 hidden';
        container.appendChild(label);

        const input = document.createElement('input');
        input.id = id;
        input.className = cn(
            'px-4 py-3 w-full outline-none transition-all body-large placeholder:text-on-surface-variant text-on-surface',
            'disabled:opacity-38 disabled:cursor-not-allowed'
        );
        container.appendChild(input);

        const error = document.createElement('span');
        error.id = errorId;
        error.className = 'md-label-small text-error px-4 hidden';
        error.setAttribute('aria-live', 'polite');
        container.appendChild(error);

        // Visual state stream
        const visualState$ = combineLatest({
            style: this.style$,
            extraClass: this.className$,
            errorText: combineLatest([this.error$, this.internalError$]).pipe(
                map(([err, internalErr]) => err || internalErr)
            ),
            enabled: this.enabled$,
            type: this.type$,
            placeholder: this.placeholder$,
            label: this.label$,
            name: this.name$,
            required: this.required$,
            readOnly: this.readOnly$,
            autocomplete: this.autocomplete$
        });

        const visualSub = visualState$.subscribe(state => {
            // Update label
            label.textContent = state.label;
            label.classList.toggle('hidden', !state.label);

            // Update error
            error.textContent = state.errorText;
            error.classList.toggle('hidden', !state.errorText);
            
            // A11y
            input.setAttribute('aria-invalid', state.errorText ? 'true' : 'false');
            input.setAttribute('aria-describedby', state.errorText ? errorId : '');
            input.disabled = !state.enabled;
            input.required = state.required;
            input.readOnly = state.readOnly;
            input.name = state.name;
            input.setAttribute('autocomplete', state.autocomplete);
            input.placeholder = state.placeholder;

            // Type handling (password masking)
            input.type = state.type;
            if (state.type === 'password') {
                input.style.setProperty('-webkit-text-security', 'asterisk');
            } else {
                input.style.removeProperty('-webkit-text-security');
            }

            // Styling
            const baseClasses = 'px-4 py-3 w-full outline-none transition-all body-large placeholder:text-on-surface-variant text-on-surface disabled:opacity-38 disabled:cursor-not-allowed';
            const validationClasses = this.getValidationClasses(state.errorText);
            
            input.className = cn(
                baseClasses,
                state.extraClass,
                validationClasses
            );

            if (this.isGlass) {
                input.classList.add('bg-white/10', 'backdrop-blur-md', 'border', 'border-white/20', 'focus:bg-white/20');
                if (state.style === TextFieldStyle.OUTLINED) {
                    input.classList.add('rounded-small');
                } else {
                    input.classList.add('rounded-t-small');
                }
            } else {
                STYLE_MAP[state.style].split(' ').forEach(c => input.classList.add(c));
            }
        });

        // Value handling
        let valueSub: { unsubscribe: () => void } | undefined;
        if (this.value$) {
            valueSub = this.value$.pipe(
                distinctUntilChanged()
            ).subscribe(val => {
                if (input.value !== val) {
                    input.value = val;
                }
            });

            const inputSub = fromEvent(input, 'input').pipe(
                map(e => (e.target as HTMLInputElement).value),
                distinctUntilChanged()
            ).subscribe(val => {
                this.value$?.next(val);
                
                // Real-time validation
                if (this.validators.length > 0) {
                    let errorMsg = '';
                    for (const validator of this.validators) {
                        const result = validator(val);
                        if (result) {
                            errorMsg = result;
                            break;
                        }
                    }
                    this.internalError$.next(errorMsg);
                }
            });
            registerDestroy(container, () => inputSub.unsubscribe());
        }

        // Event handling
        const focusSub = fromEvent<FocusEvent>(input, 'focus').subscribe(e => this.focusSubject.next(e));
        const blurSub = fromEvent<FocusEvent>(input, 'blur').subscribe(e => this.blurSubject.next(e));
        const changeSub = fromEvent<Event>(input, 'change').subscribe(e => this.changeSubject.next(e));

        registerDestroy(container, () => {
            visualSub.unsubscribe();
            valueSub?.unsubscribe();
            focusSub.unsubscribe();
            blurSub.unsubscribe();
            changeSub.unsubscribe();
        });

        return container;
    }
}
