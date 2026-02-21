import { BehaviorSubject, Subject } from 'rxjs';
import { TextFieldBuilder, TextFieldStyle } from './text-field';

describe('TextFieldBuilder', () => {
    let builder: TextFieldBuilder;

    beforeEach(() => {
        builder = new TextFieldBuilder();
    });

    test('should render a container with an input element', () => {
        const container = builder.build();
        expect(container.tagName).toBe('DIV');
        expect(container.querySelector('input')).toBeTruthy();
    });

    test('should update placeholder reactively', () => {
        const placeholder$ = new BehaviorSubject('Initial Placeholder');
        const container = builder.withPlaceholder(placeholder$).build();
        const input = container.querySelector('input') as HTMLInputElement;

        expect(input.placeholder).toBe('Initial Placeholder');

        placeholder$.next('Updated Placeholder');
        expect(input.placeholder).toBe('Updated Placeholder');
    });

    test('should update value reactively from observable', () => {
        const value$ = new BehaviorSubject('Initial Value');
        const container = builder.withValue(value$).build();
        const input = container.querySelector('input') as HTMLInputElement;

        expect(input.value).toBe('Initial Value');

        value$.next('Updated Value');
        expect(input.value).toBe('Updated Value');
    });

    test('should update observable on input event', () => {
        const value$ = new BehaviorSubject('Initial');
        const container = builder.withValue(value$).build();
        const input = container.querySelector('input') as HTMLInputElement;

        input.value = 'New User Input';
        input.dispatchEvent(new Event('input'));

        expect(value$.getValue()).toBe('New User Input');
    });

    test('should handle enabled state reactively', () => {
        const enabled$ = new BehaviorSubject(true);
        const container = builder.withEnabled(enabled$).build();
        const input = container.querySelector('input') as HTMLInputElement;

        expect(input.disabled).toBe(false);

        enabled$.next(false);
        expect(input.disabled).toBe(true);
    });

    test('should handle style updates reactively', () => {
        const style$ = new BehaviorSubject(TextFieldStyle.TONAL);
        const container = builder.withStyle(style$).build();
        const input = container.querySelector('input') as HTMLInputElement;

        expect(input.classList.contains('bg-surface-variant')).toBe(true);

        style$.next(TextFieldStyle.OUTLINED);
        expect(input.classList.contains('bg-surface-variant')).toBe(false);
        expect(input.classList.contains('bg-transparent')).toBe(true);
    });

    test('should update label reactively and use label element', () => {
        const label$ = new BehaviorSubject('');
        const container = builder.withLabel(label$).build();
        const labelEl = container.querySelector('label') as HTMLLabelElement;
        const input = container.querySelector('input') as HTMLInputElement;

        expect(labelEl.classList.contains('hidden')).toBe(true);
        expect(labelEl.htmlFor).toBe(input.id);

        label$.next('Test Label');
        expect(labelEl.textContent).toBe('Test Label');
        expect(labelEl.classList.contains('hidden')).toBe(false);
    });

    test('should update error reactively and set ARIA attributes', () => {
        const error$ = new BehaviorSubject('');
        const container = builder.withError(error$).build();
        const errorEl = container.querySelector('span:last-child') as HTMLElement;
        const input = container.querySelector('input') as HTMLInputElement;

        expect(errorEl.classList.contains('hidden')).toBe(true);
        expect(input.getAttribute('aria-invalid')).toBe('false');

        error$.next('Invalid input');
        expect(errorEl.textContent).toBe('Invalid input');
        expect(errorEl.classList.contains('hidden')).toBe(false);
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.getAttribute('aria-describedby')).toBe(errorEl.id);
    });

    test('should apply custom class reactively', () => {
        const class$ = new BehaviorSubject('custom-class');
        const container = builder.withClass(class$).build();
        const input = container.querySelector('input') as HTMLInputElement;

        expect(input.classList.contains('custom-class')).toBe(true);

        class$.next('another-class');
        expect(input.classList.contains('custom-class')).toBe(false);
        expect(input.classList.contains('another-class')).toBe(true);
    });

    test('should support password mode', () => {
        const container = builder.asPassword().build();
        const input = container.querySelector('input') as HTMLInputElement;
        expect(input.type).toBe('password');
    });

    test('should support email mode', () => {
        const container = builder.asEmail().build();
        const input = container.querySelector('input') as HTMLInputElement;
        expect(input.type).toBe('email');
    });

    test('should expose event observables', (done) => {
        const container = builder.build();
        const input = container.querySelector('input') as HTMLInputElement;
        
        builder.onFocus().subscribe(() => {
            done();
        });

        input.dispatchEvent(new FocusEvent('focus'));
    });

    test('should handle required and readonly states', () => {
        const required$ = new BehaviorSubject(false);
        const readOnly$ = new BehaviorSubject(false);
        const container = builder.withRequired(required$).withReadOnly(readOnly$).build();
        const input = container.querySelector('input') as HTMLInputElement;

        expect(input.required).toBe(false);
        expect(input.readOnly).toBe(false);

        required$.next(true);
        readOnly$.next(true);
        expect(input.required).toBe(true);
        expect(input.readOnly).toBe(true);
    });

    test('should apply glass effect classes', () => {
        const container = builder.asGlass().build();
        const input = container.querySelector('input') as HTMLInputElement;

        expect(input.classList.contains('bg-white/10')).toBe(true);
        expect(input.classList.contains('backdrop-blur-md')).toBe(true);
    });
});
