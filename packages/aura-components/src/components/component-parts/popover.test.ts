import { BehaviorSubject } from 'rxjs';
import { PopoverBuilder } from './popover';
import { ComponentBuilder } from '../../core/component-builder';

// Helper: minimal ComponentBuilder returning a simple div
function makeContent(text = 'content'): ComponentBuilder {
    return {
        build() {
            const el = document.createElement('div');
            el.textContent = text;
            return el;
        }
    };
}

// Helper: create anchor element appended to body (needed for getBoundingClientRect mocking)
function makeAnchor(rect: Partial<DOMRect> = {}): HTMLElement {
    const el = document.createElement('button');
    const defaults = { top: 100, bottom: 120, left: 50, right: 200, width: 150, height: 20, x: 50, y: 100, toJSON: () => {} };
    el.getBoundingClientRect = () => Object.assign({}, defaults, rect) as DOMRect;
    document.body.appendChild(el);
    return el;
}

// Spy on showPopover / hidePopover at prototype level for call tracking
function spyOnPopoverMethods() {
    const showSpy = jest.spyOn(HTMLElement.prototype, 'showPopover');
    const hideSpy = jest.spyOn(HTMLElement.prototype, 'hidePopover');
    return { showSpy, hideSpy };
}

describe('PopoverBuilder', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // ────────────────────────────────────────────────
    // Configuration / builder API
    // ────────────────────────────────────────────────

    describe('builder API', () => {
        test('withAnchor returns this (fluent)', () => {
            const builder = new PopoverBuilder();
            const anchor = makeAnchor();
            expect(builder.withAnchor(anchor)).toBe(builder);
        });

        test('withContent returns this (fluent)', () => {
            const builder = new PopoverBuilder();
            expect(builder.withContent(makeContent())).toBe(builder);
        });

        test('withWidth returns this (fluent)', () => {
            const builder = new PopoverBuilder();
            expect(builder.withWidth('auto')).toBe(builder);
        });

        test('withOffset returns this (fluent)', () => {
            const builder = new PopoverBuilder();
            expect(builder.withOffset(10)).toBe(builder);
        });

        test('withClass returns this (fluent)', () => {
            const builder = new PopoverBuilder();
            expect(builder.withClass('my-class')).toBe(builder);
        });

        test('withOnClose returns this (fluent)', () => {
            const builder = new PopoverBuilder();
            expect(builder.withOnClose(() => {})).toBe(builder);
        });

        test('asGlass returns this (fluent)', () => {
            const builder = new PopoverBuilder();
            expect(builder.asGlass()).toBe(builder);
        });
    });

    // ────────────────────────────────────────────────
    // show() guard clauses
    // ────────────────────────────────────────────────

    describe('show() validation', () => {
        test('throws when no anchor is set', () => {
            const builder = new PopoverBuilder().withContent(makeContent());
            expect(() => builder.show()).toThrow('PopoverBuilder: anchor is required before show()');
        });

        test('throws when no content is set', () => {
            const anchor = makeAnchor();
            const builder = new PopoverBuilder().withAnchor(anchor);
            expect(() => builder.show()).toThrow('PopoverBuilder: content is required before show()');
        });
    });

    // ────────────────────────────────────────────────
    // show() happy path
    // ────────────────────────────────────────────────

    describe('show()', () => {
        test('appends popover element to document.body', () => {
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .show();

            const popover = document.body.querySelector('[popover]');
            expect(popover).not.toBeNull();
        });

        test('calls showPopover() on first show', () => {
            const { showSpy } = spyOnPopoverMethods();
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .show();

            expect(showSpy).toHaveBeenCalledTimes(1);
        });

        test('does NOT call showPopover() on second show (already open)', () => {
            const { showSpy } = spyOnPopoverMethods();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());

            builder.show();
            builder.show();

            expect(showSpy).toHaveBeenCalledTimes(1);
        });

        test('repositions on second show (top/left updated)', () => {
            let callCount = 0;
            const anchor = document.createElement('button');
            anchor.getBoundingClientRect = () => {
                callCount++;
                return { top: 100, bottom: 120, left: 50, right: 200, width: 150, height: 20, x: 50, y: 100, toJSON: () => {} } as DOMRect;
            };
            document.body.appendChild(anchor);

            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());

            builder.show();
            const before = callCount;
            builder.show(); // should call _position() again
            expect(callCount).toBeGreaterThan(before);
        });

        test('sets popover attribute to "manual"', () => {
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .show();

            const popover = document.body.querySelector('[popover]')!;
            expect(popover.getAttribute('popover')).toBe('manual');
        });

        test('appends content inside popover element', () => {
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent('hello'))
                .show();

            const popover = document.body.querySelector('[popover]')!;
            expect(popover.textContent).toBe('hello');
        });
    });

    // ────────────────────────────────────────────────
    // Positioning
    // ────────────────────────────────────────────────

    describe('positioning', () => {
        test('positions top = rect.bottom + offset (default 4)', () => {
            const anchor = makeAnchor({ bottom: 120, left: 50, width: 150 });
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());
            builder.show();

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            expect(popover.style.top).toBe('124px'); // 120 + 4
        });

        test('positions left = rect.left', () => {
            const anchor = makeAnchor({ bottom: 120, left: 50, width: 150 });
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());
            builder.show();

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            expect(popover.style.left).toBe('50px');
        });

        test('withOffset changes vertical gap', () => {
            const anchor = makeAnchor({ bottom: 120, left: 50, width: 150 });
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOffset(10);
            builder.show();

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            expect(popover.style.top).toBe('130px'); // 120 + 10
        });
    });

    // ────────────────────────────────────────────────
    // Width modes
    // ────────────────────────────────────────────────

    describe('width modes', () => {
        test('match-anchor (default): sets width = anchorRect.width, clears minWidth', () => {
            const anchor = makeAnchor({ width: 150 });
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());
            builder.show();

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            expect(popover.style.width).toBe('150px');
            expect(popover.style.minWidth).toBe('');
        });

        test('auto: sets width = auto and minWidth = anchorRect.width', () => {
            const anchor = makeAnchor({ width: 150 });
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withWidth('auto');
            builder.show();

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            expect(popover.style.width).toBe('auto');
            expect(popover.style.minWidth).toBe('150px');
        });

        test('custom string: sets width as CSS value, clears minWidth', () => {
            const anchor = makeAnchor({ width: 150 });
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withWidth('300px');
            builder.show();

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            expect(popover.style.width).toBe('300px');
            expect(popover.style.minWidth).toBe('');
        });

        test('Observable<PopoverWidth>: subscribes and applies latest value', () => {
            const width$ = new BehaviorSubject<string>('auto');
            const anchor = makeAnchor({ width: 150 });
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withWidth(width$);
            builder.show();

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            expect(popover.style.width).toBe('auto');
            expect(popover.style.minWidth).toBe('150px');
        });

        test('Observable width: reactive update repositions when open', () => {
            const width$ = new BehaviorSubject<string>('auto');
            const anchor = makeAnchor({ width: 150 });
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withWidth(width$);
            builder.show();

            // Push new value while open — should trigger _position()
            width$.next('300px');

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            expect(popover.style.width).toBe('300px');
            expect(popover.style.minWidth).toBe('');
        });
    });

    // ────────────────────────────────────────────────
    // CSS classes
    // ────────────────────────────────────────────────

    describe('CSS classes', () => {
        test('applies base classes on build', () => {
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .show();

            const popover = document.body.querySelector('[popover]')!;
            expect(popover.classList.contains('fixed')).toBe(true);
            expect(popover.classList.contains('rounded-small')).toBe(true);
        });

        test('asGlass adds glass-effect class', () => {
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .asGlass()
                .show();

            const popover = document.body.querySelector('[popover]')!;
            expect(popover.classList.contains('glass-effect')).toBe(true);
        });

        test('without asGlass does not add glass-effect', () => {
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .show();

            const popover = document.body.querySelector('[popover]')!;
            expect(popover.classList.contains('glass-effect')).toBe(false);
        });

        test('withClass adds extra CSS class', () => {
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withClass('my-custom-class')
                .show();

            const popover = document.body.querySelector('[popover]')!;
            expect(popover.classList.contains('my-custom-class')).toBe(true);
        });

        test('withClass supports space-separated classes', () => {
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withClass('class-a class-b')
                .show();

            const popover = document.body.querySelector('[popover]')!;
            expect(popover.classList.contains('class-a')).toBe(true);
            expect(popover.classList.contains('class-b')).toBe(true);
        });
    });

    // ────────────────────────────────────────────────
    // close()
    // ────────────────────────────────────────────────

    describe('close()', () => {
        test('calls hidePopover() when open', () => {
            const { hideSpy } = spyOnPopoverMethods();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());
            builder.show();
            builder.close();

            expect(hideSpy).toHaveBeenCalledTimes(1);
        });

        test('sets _isOpen to false (second close is no-op — hidePopover not called again)', () => {
            const { hideSpy } = spyOnPopoverMethods();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());
            builder.show();
            builder.close();
            builder.close(); // no-op

            expect(hideSpy).toHaveBeenCalledTimes(1);
        });

        test('fires _onCloseCb exactly once on close', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();
            builder.close();

            expect(cb).toHaveBeenCalledTimes(1);
        });

        test('close() before show() is a no-op (no popover element)', () => {
            const cb = jest.fn();
            const builder = new PopoverBuilder().withOnClose(cb);
            expect(() => builder.close()).not.toThrow();
            expect(cb).not.toHaveBeenCalled();
        });

        test('does NOT call showPopover() again after close+show', () => {
            const { showSpy } = spyOnPopoverMethods();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());
            builder.show();  // call 1
            builder.close();
            builder.show();  // call 2 — re-open

            expect(showSpy).toHaveBeenCalledTimes(2);
        });
    });

    // ────────────────────────────────────────────────
    // withOnClose callback
    // ────────────────────────────────────────────────

    describe('withOnClose callback', () => {
        test('fires exactly once per close, not on double-close', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();
            builder.close();
            builder.close(); // no-op

            expect(cb).toHaveBeenCalledTimes(1);
        });

        test('fires again after re-open and re-close', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();
            builder.close();
            builder.show();
            builder.close();

            expect(cb).toHaveBeenCalledTimes(2);
        });
    });

    // ────────────────────────────────────────────────
    // Click outside → close
    // ────────────────────────────────────────────────

    describe('click outside', () => {
        test('click outside anchor and popover closes the popover', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();

            const outside = document.createElement('div');
            document.body.appendChild(outside);
            outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(cb).toHaveBeenCalledTimes(1);
        });

        test('click on anchor does NOT close the popover', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();

            anchor.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(cb).not.toHaveBeenCalled();
        });

        test('click inside popover does NOT close the popover', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();

            const popover = document.body.querySelector('[popover]')!;
            const innerEl = popover.querySelector('div')!;
            innerEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(cb).not.toHaveBeenCalled();
        });

        test('click outside when already closed is a no-op', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();
            builder.close();
            cb.mockClear();

            const outside = document.createElement('div');
            document.body.appendChild(outside);
            outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(cb).not.toHaveBeenCalled();
        });
    });

    // ────────────────────────────────────────────────
    // Scroll outside → close
    // ────────────────────────────────────────────────

    describe('scroll outside', () => {
        test('scroll outside popover closes and fires callback', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();

            // Dispatch a scroll event on an element outside the popover
            document.dispatchEvent(new Event('scroll', { bubbles: true }));

            expect(cb).toHaveBeenCalledTimes(1);
        });

        test('scroll inside popover does NOT close', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();

            const popover = document.body.querySelector('[popover]')!;
            popover.dispatchEvent(new Event('scroll', { bubbles: true }));

            expect(cb).not.toHaveBeenCalled();
        });
    });

    // ────────────────────────────────────────────────
    // Window resize → close
    // ────────────────────────────────────────────────

    describe('window resize', () => {
        test('window resize closes and fires callback', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();

            window.dispatchEvent(new Event('resize'));

            expect(cb).toHaveBeenCalledTimes(1);
        });

        test('window resize when already closed is a no-op', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();
            builder.close();
            cb.mockClear();

            window.dispatchEvent(new Event('resize'));

            expect(cb).not.toHaveBeenCalled();
        });
    });

    // ────────────────────────────────────────────────
    // _cleanup via registerDestroy
    // ────────────────────────────────────────────────

    describe('_cleanup (registerDestroy on anchor)', () => {
        test('cleanup fires _onCloseCb if open', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();

            // Trigger cleanup by removing anchor from DOM (MutationObserver fires destroyMap callbacks)
            // Instead, call registerDestroy directly by removing anchor
            // Since the destroy is registered on the anchor, remove it from the DOM
            anchor.remove();

            // MutationObserver is async — give it a tick
            return new Promise<void>(resolve => setTimeout(resolve, 0)).then(() => {
                expect(cb).toHaveBeenCalledTimes(1);
            });
        });

        test('cleanup removes popover element from DOM', () => {
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());
            builder.show();

            expect(document.body.querySelector('[popover]')).not.toBeNull();

            anchor.remove();

            return new Promise<void>(resolve => setTimeout(resolve, 0)).then(() => {
                expect(document.body.querySelector('[popover]')).toBeNull();
            });
        });

        test('cleanup does NOT fire _onCloseCb if already closed', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();
            builder.close(); // sets _isOpen = false
            cb.mockClear();

            anchor.remove();

            return new Promise<void>(resolve => setTimeout(resolve, 0)).then(() => {
                expect(cb).not.toHaveBeenCalled();
            });
        });
    });

    // ────────────────────────────────────────────────
    // build()
    // ────────────────────────────────────────────────

    describe('build()', () => {
        test('build() returns this (fluent)', () => {
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());
            expect(builder.build()).toBe(builder);
        });

        test('build() creates popover element in document.body without calling showPopover()', () => {
            const { showSpy } = spyOnPopoverMethods();
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .build();

            expect(document.body.querySelector('[popover]')).not.toBeNull();
            expect(showSpy).not.toHaveBeenCalled();
        });

        test('build() makes the popover element queryable (it\'s in DOM) but not visible', () => {
            const { showSpy } = spyOnPopoverMethods();
            const anchor = makeAnchor();
            new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent('pre-built'))
                .build();

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            // Element is in the DOM and its content is accessible
            expect(popover).not.toBeNull();
            expect(popover.textContent).toBe('pre-built');
            // showPopover() was never called — the element was not made visible
            expect(showSpy).not.toHaveBeenCalled();
        });

        test('subsequent show() works correctly after build() — calls showPopover() once', () => {
            const { showSpy } = spyOnPopoverMethods();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());

            builder.build();
            builder.show();

            expect(showSpy).toHaveBeenCalledTimes(1);
            // Same element reused (not rebuilt)
            expect(document.body.querySelectorAll('[popover]').length).toBe(1);
        });
    });

    // ────────────────────────────────────────────────
    // Lazy build — popover element not created until show()
    // ────────────────────────────────────────────────

    describe('lazy build', () => {
        test('no popover element exists before show()', () => {
            makeAnchor(); // appended to body but not used in builder
            new PopoverBuilder()
                .withAnchor(makeAnchor())
                .withContent(makeContent());

            // No show() called — popover should not be in DOM
            expect(document.body.querySelector('[popover]')).toBeNull();
        });

        test('popover element is reused on second show() (not rebuilt)', () => {
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent());
            builder.show();
            const first = document.body.querySelector('[popover]');
            builder.close();
            builder.show();
            const second = document.body.querySelector('[popover]');

            expect(first).toBe(second);
        });
    });

    // ────────────────────────────────────────────────
    // Mutual exclusion
    // ────────────────────────────────────────────────

    describe('mutual exclusion', () => {
        test('opening a second popover automatically closes the first', () => {
            const cb1 = jest.fn();
            const anchor1 = makeAnchor();
            const builder1 = new PopoverBuilder()
                .withAnchor(anchor1)
                .withContent(makeContent('first'))
                .withOnClose(cb1);
            builder1.show();

            const anchor2 = makeAnchor();
            const builder2 = new PopoverBuilder()
                .withAnchor(anchor2)
                .withContent(makeContent('second'));
            builder2.show();

            expect(cb1).toHaveBeenCalledTimes(1);
            // builder2 should now be open (showPopover called for it)
            // Verify by closing it and confirming no error / it was open
            expect(() => builder2.close()).not.toThrow();
        });

        test('opening the same popover again does NOT close it (idempotent)', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();
            builder.show(); // calling show on already-open popover

            expect(cb).not.toHaveBeenCalled();
        });

        test('after first popover closes normally, opening a second still works', () => {
            const cb1 = jest.fn();
            const anchor1 = makeAnchor();
            const builder1 = new PopoverBuilder()
                .withAnchor(anchor1)
                .withContent(makeContent('first'))
                .withOnClose(cb1);
            builder1.show();
            builder1.close(); // normal close — clears _activePopover

            const cb2 = jest.fn();
            const anchor2 = makeAnchor();
            const builder2 = new PopoverBuilder()
                .withAnchor(anchor2)
                .withContent(makeContent('second'))
                .withOnClose(cb2);
            builder2.show();

            // first was already closed, cb1 should not be called again
            expect(cb1).toHaveBeenCalledTimes(1);
            // second opened cleanly
            builder2.close();
            expect(cb2).toHaveBeenCalledTimes(1);
        });
    });

    // ────────────────────────────────────────────────
    // toggle event (Escape / native dismissal guard)
    // ────────────────────────────────────────────────

    describe('toggle event guard (native dismissal)', () => {
        test('toggle event with newState=closed fires _onCloseCb when open', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();

            const popover = document.body.querySelector('[popover]')!;
            // Simulate native toggle event (e.g. Escape key on popover="auto")
            const event = new Event('toggle') as any;
            event.newState = 'closed';
            popover.dispatchEvent(event);

            expect(cb).toHaveBeenCalledTimes(1);
        });

        test('toggle event does NOT double-fire if already closed via _onClose', () => {
            const cb = jest.fn();
            const anchor = makeAnchor();
            const builder = new PopoverBuilder()
                .withAnchor(anchor)
                .withContent(makeContent())
                .withOnClose(cb);
            builder.show();

            // Programmatic close sets _isOpen=false first, then hides popover
            builder.close(); // fires cb once, sets _isOpen=false

            // Now if toggle event fires (e.g. hidePopover triggered it), _isOpen is already false
            const popover = document.body.querySelector('[popover]')!;
            const event = new Event('toggle') as any;
            event.newState = 'closed';
            popover.dispatchEvent(event);

            expect(cb).toHaveBeenCalledTimes(1); // no double-fire
        });
    });
});
