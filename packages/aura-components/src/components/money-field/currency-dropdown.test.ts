import { Subject, BehaviorSubject } from 'rxjs';
import { createCurrencyDropdown } from './currency-dropdown';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSetup(opts: {
    currencies?: string[];
    isGlass?: boolean;
    initialEnabled?: boolean;
} = {}) {
    const currencies = opts.currencies ?? ['USD', 'EUR', 'GBP'];
    const currencyValue$ = new Subject<string | null>();
    const enabled$ = new BehaviorSubject<boolean>(opts.initialEnabled ?? true);

    const container = createCurrencyDropdown(
        currencies,
        currencyValue$,
        enabled$,
        opts.isGlass ?? false
    );

    document.body.appendChild(container);

    const button = container.querySelector('button') as HTMLButtonElement;

    function getPopover(): HTMLElement | null {
        return document.body.querySelector('[popover]') as HTMLElement | null;
    }

    function getListbox(): HTMLUListElement | null {
        const popover = getPopover();
        return popover ? popover.querySelector('ul[role="listbox"]') : null;
    }

    function getItems(): HTMLLIElement[] {
        const listbox = getListbox();
        return listbox ? Array.from(listbox.querySelectorAll('li[role="option"]')) as HTMLLIElement[] : [];
    }

    function clickButton() {
        button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }

    function pressKey(key: string) {
        button.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    }

    function isOpen(): boolean {
        return button.getAttribute('aria-expanded') === 'true';
    }

    function cleanup() {
        container.remove();
        document.body.querySelectorAll('[popover]').forEach(el => el.remove());
    }

    return { container, button, currencyValue$, enabled$, currencies, getPopover, getListbox, getItems, clickButton, pressKey, isOpen, cleanup };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

// jsdom does not implement scrollIntoView — stub it globally
beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('createCurrencyDropdown', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 1 — clicking the button opens the dropdown
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 1: clicking button opens the popover', () => {
        test('button click opens the listbox popover', () => {
            const { clickButton, getPopover, isOpen } = makeSetup();
            expect(isOpen()).toBe(false);
            expect(getPopover()).toBeNull();

            clickButton();

            expect(isOpen()).toBe(true);
            expect(getPopover()).not.toBeNull();
        });

        test('clicking an already-open dropdown closes it (toggle)', () => {
            const { clickButton, isOpen } = makeSetup();
            clickButton();
            expect(isOpen()).toBe(true);

            clickButton();
            expect(isOpen()).toBe(false);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 2 — selecting a currency closes the popover and emits via currencyValue$
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 2: clicking a currency option closes popover and emits currency', () => {
        test('emits the selected currency id via currencyValue$', () => {
            const { clickButton, getItems, currencyValue$ } = makeSetup({ currencies: ['USD', 'EUR', 'GBP'] });
            const emitted: Array<string | null> = [];
            currencyValue$.subscribe(v => emitted.push(v));

            clickButton();
            const items = getItems();
            expect(items.length).toBe(3);

            items[1].click(); // EUR
            expect(emitted).toContain('EUR');
        });

        test('clicking an option closes the popover', () => {
            const { clickButton, getItems, isOpen } = makeSetup();
            clickButton();

            const items = getItems();
            items[0].click();

            expect(isOpen()).toBe(false);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 3 — keyboard navigation
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 3: keyboard navigation', () => {
        test('ArrowDown opens the dropdown when closed', () => {
            const { pressKey, isOpen } = makeSetup();
            expect(isOpen()).toBe(false);
            pressKey('ArrowDown');
            expect(isOpen()).toBe(true);
        });

        test('ArrowUp opens the dropdown when closed', () => {
            const { pressKey, isOpen } = makeSetup();
            pressKey('ArrowUp');
            expect(isOpen()).toBe(true);
        });

        test('Space opens the dropdown when closed', () => {
            const { pressKey, isOpen } = makeSetup();
            pressKey(' ');
            expect(isOpen()).toBe(true);
        });

        test('ArrowDown navigates down when open', () => {
            const { clickButton, pressKey, button } = makeSetup({ currencies: ['USD', 'EUR', 'GBP'] });
            clickButton();

            // Focus starts at index 0; after one ArrowDown it should be at index 1
            const beforeDesc = button.getAttribute('aria-activedescendant') ?? '';
            pressKey('ArrowDown');
            const afterDesc = button.getAttribute('aria-activedescendant') ?? '';

            expect(afterDesc).not.toBe(beforeDesc);
            expect(afterDesc).toContain('-opt-1');
        });

        test('ArrowUp navigates up when open', () => {
            const { clickButton, pressKey, button } = makeSetup({ currencies: ['USD', 'EUR', 'GBP'] });
            clickButton();

            // First go down to index 1, then up back to index 0
            pressKey('ArrowDown');
            pressKey('ArrowUp');
            const desc = button.getAttribute('aria-activedescendant') ?? '';
            expect(desc).toContain('-opt-0');
        });

        test('ArrowDown does not go past the last item', () => {
            const { clickButton, pressKey, button } = makeSetup({ currencies: ['USD', 'EUR'] });
            clickButton();

            pressKey('ArrowDown'); // goes to index 1
            pressKey('ArrowDown'); // should stay at index 1

            const desc = button.getAttribute('aria-activedescendant') ?? '';
            expect(desc).toContain('-opt-1');
        });

        test('ArrowUp does not go past the first item', () => {
            const { clickButton, pressKey, button } = makeSetup({ currencies: ['USD', 'EUR'] });
            clickButton();

            pressKey('ArrowUp'); // already at 0, should stay at 0
            const desc = button.getAttribute('aria-activedescendant') ?? '';
            expect(desc).toContain('-opt-0');
        });

        test('Enter selects the focused item and closes the popover', () => {
            const { clickButton, pressKey, currencyValue$, isOpen } = makeSetup({ currencies: ['USD', 'EUR', 'GBP'] });
            const emitted: Array<string | null> = [];
            currencyValue$.subscribe(v => emitted.push(v));

            clickButton();
            pressKey('ArrowDown'); // move to EUR (index 1)
            pressKey('Enter');

            expect(emitted).toContain('EUR');
            expect(isOpen()).toBe(false);
        });

        test('Space selects the focused item and closes the popover', () => {
            const { clickButton, pressKey, currencyValue$, isOpen } = makeSetup({ currencies: ['USD', 'EUR', 'GBP'] });
            const emitted: Array<string | null> = [];
            currencyValue$.subscribe(v => emitted.push(v));

            clickButton();
            pressKey('ArrowDown'); // index 1 = EUR
            pressKey(' ');

            expect(emitted).toContain('EUR');
            expect(isOpen()).toBe(false);
        });

        test('Escape closes the dropdown when open', () => {
            const { clickButton, pressKey, isOpen } = makeSetup();
            clickButton();
            expect(isOpen()).toBe(true);

            pressKey('Escape');
            expect(isOpen()).toBe(false);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 4 — aria-expanded reflects open/closed state
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 4: aria-expanded reflects state', () => {
        test('aria-expanded is "false" initially', () => {
            const { button } = makeSetup();
            expect(button.getAttribute('aria-expanded')).toBe('false');
        });

        test('aria-expanded becomes "true" when open', () => {
            const { clickButton, button } = makeSetup();
            clickButton();
            expect(button.getAttribute('aria-expanded')).toBe('true');
        });

        test('aria-expanded returns to "false" after closing', () => {
            const { clickButton, button } = makeSetup();
            clickButton();
            clickButton();
            expect(button.getAttribute('aria-expanded')).toBe('false');
        });

        test('aria-expanded returns to "false" after Escape', () => {
            const { clickButton, pressKey, button } = makeSetup();
            clickButton();
            pressKey('Escape');
            expect(button.getAttribute('aria-expanded')).toBe('false');
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 5 — aria-activedescendant
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 5: aria-activedescendant', () => {
        test('aria-activedescendant is set when open', () => {
            const { clickButton, button } = makeSetup();
            clickButton();
            expect(button.hasAttribute('aria-activedescendant')).toBe(true);
            expect(button.getAttribute('aria-activedescendant')).toMatch(/currency-listbox-\d+-opt-\d+/);
        });

        test('aria-activedescendant is removed when closed via Escape', () => {
            const { clickButton, pressKey, button } = makeSetup();
            clickButton();
            pressKey('Escape');
            expect(button.hasAttribute('aria-activedescendant')).toBe(false);
        });

        test('aria-activedescendant is removed after item click-selection', () => {
            const { clickButton, getItems, button } = makeSetup();
            clickButton();
            getItems()[0].click();
            expect(button.hasAttribute('aria-activedescendant')).toBe(false);
        });

        test('aria-activedescendant points to the correct li id', () => {
            const { clickButton, button, getItems } = makeSetup({ currencies: ['USD', 'EUR'] });
            clickButton();

            const items = getItems();
            const desc = button.getAttribute('aria-activedescendant')!;
            const focusedItem = document.getElementById(desc);
            expect(focusedItem).not.toBeNull();
            expect(items).toContain(focusedItem);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 6 — click outside closes the popover
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 6: click outside closes the popover', () => {
        test('clicking outside the button and listbox closes the popover', () => {
            const { clickButton, isOpen } = makeSetup();
            clickButton();
            expect(isOpen()).toBe(true);

            const outside = document.createElement('div');
            document.body.appendChild(outside);
            outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(isOpen()).toBe(false);
        });

        test('clicking the button itself does not double-close (toggle)', () => {
            const { clickButton, isOpen } = makeSetup();
            clickButton(); // open
            clickButton(); // close (toggle)
            // Button click calls toggleDropdown; the click-outside listener excludes
            // the anchor, so it does NOT also fire a close. Net effect: one clean toggle.
            expect(isOpen()).toBe(false);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 7 — scroll outside closes the popover
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 7: scroll outside closes the popover', () => {
        test('scroll event outside the popover closes it', () => {
            const { clickButton, isOpen } = makeSetup();
            clickButton();
            expect(isOpen()).toBe(true);

            document.dispatchEvent(new Event('scroll', { bubbles: true }));
            expect(isOpen()).toBe(false);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 8 — window resize closes the popover
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 8: window resize closes the popover', () => {
        test('window resize event closes the open popover', () => {
            const { clickButton, isOpen } = makeSetup();
            clickButton();
            expect(isOpen()).toBe(true);

            window.dispatchEvent(new Event('resize'));
            expect(isOpen()).toBe(false);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 9 — enabled$ = false: closes dropdown, disables button
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 9: enabled$ = false closes dropdown and disables button', () => {
        test('button becomes disabled when enabled$ emits false', () => {
            const { button, enabled$ } = makeSetup();
            expect(button.classList.contains('pointer-events-none')).toBe(false);

            enabled$.next(false);
            expect(button.classList.contains('pointer-events-none')).toBe(true);
            expect(button.classList.contains('opacity-38')).toBe(true);
            expect(button.classList.contains('cursor-not-allowed')).toBe(true);
        });

        test('open dropdown closes when enabled$ emits false', () => {
            const { clickButton, enabled$, isOpen } = makeSetup();
            clickButton();
            expect(isOpen()).toBe(true);

            enabled$.next(false);
            expect(isOpen()).toBe(false);
        });

        test('button is re-enabled when enabled$ emits true again', () => {
            const { button, enabled$ } = makeSetup();
            enabled$.next(false);
            enabled$.next(true);

            expect(button.classList.contains('pointer-events-none')).toBe(false);
            expect(button.classList.contains('opacity-38')).toBe(false);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 10 — glass mode: popover uses asGlass(), listbox has no glass class
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 10: glass mode styling', () => {
        test('popover element has glass-effect class in glass mode', () => {
            const { clickButton, getPopover } = makeSetup({ isGlass: true });
            clickButton();
            const popover = getPopover()!;
            expect(popover.classList.contains('glass-effect')).toBe(true);
        });

        test('listbox does NOT have glass-effect class in glass mode', () => {
            const { clickButton, getListbox } = makeSetup({ isGlass: true });
            clickButton();
            const listbox = getListbox()!;
            expect(listbox.classList.contains('glass-effect')).toBe(false);
        });

        test('popover does NOT have glass-effect class in non-glass mode', () => {
            const { clickButton, getPopover } = makeSetup({ isGlass: false });
            clickButton();
            const popover = getPopover()!;
            expect(popover.classList.contains('glass-effect')).toBe(false);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 11 — non-glass mode: bg-surface/border on popover outer div, not on listbox
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 11: non-glass mode popover outer div classes', () => {
        test('popover outer div has bg-surface class in non-glass mode', () => {
            const { clickButton, getPopover } = makeSetup({ isGlass: false });
            clickButton();
            const popover = getPopover()!;
            expect(popover.classList.contains('bg-surface')).toBe(true);
        });

        test('popover outer div has border and border-outline classes in non-glass mode', () => {
            const { clickButton, getPopover } = makeSetup({ isGlass: false });
            clickButton();
            const popover = getPopover()!;
            expect(popover.classList.contains('border')).toBe(true);
            expect(popover.classList.contains('border-outline')).toBe(true);
        });

        test('listbox ul does NOT have bg-surface or border classes in non-glass mode', () => {
            const { clickButton, getListbox } = makeSetup({ isGlass: false });
            clickButton();
            const listbox = getListbox()!;
            expect(listbox.classList.contains('bg-surface')).toBe(false);
            expect(listbox.classList.contains('border')).toBe(false);
            expect(listbox.classList.contains('border-outline')).toBe(false);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 12 — listbox ul has only py-2 class (max-w moved to popover)
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 12: listbox ul class list', () => {
        test('listbox ul has py-2 class', () => {
            const { clickButton, getListbox } = makeSetup();
            clickButton();
            expect(getListbox()!.classList.contains('py-2')).toBe(true);
        });

        test('listbox ul does NOT have max-w-[300px] class (max-width is on popover element, not listbox)', () => {
            const { clickButton, getListbox } = makeSetup();
            clickButton();
            expect(getListbox()!.className).not.toContain('max-w-[300px]');
        });

        test('listbox ul has exactly the expected classes (only py-2)', () => {
            const { clickButton, getListbox } = makeSetup();
            clickButton();
            const listbox = getListbox()!;
            expect(listbox.className).toBe('py-2');
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 15 — popover uses end alignment and 300px max-width
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 15: popover alignment and max-width', () => {
        test('popover element has maxWidth of 300px after opening', () => {
            const { clickButton, getPopover } = makeSetup();
            clickButton();
            const popover = getPopover()!;
            expect(popover.style.maxWidth).toBe('300px');
        });

        test('popover uses end alignment: left style is set (not right)', () => {
            const { clickButton, getPopover } = makeSetup();
            clickButton();
            const popover = getPopover()!;
            // New behaviour: end alignment uses CSS left (not right)
            expect(popover.style.left).not.toBe('');
            expect(popover.style.right).toBe('');
        });

        test('popover left style equals button rect.right (pre-render, offsetWidth=0 in jsdom)', () => {
            const { button, clickButton, getPopover } = makeSetup();
            // Override getBoundingClientRect on the button to get predictable values
            const mockRight = 350;
            button.getBoundingClientRect = () => ({
                top: 100, bottom: 120, left: 200, right: mockRight,
                width: 150, height: 20, x: 200, y: 100, toJSON: () => {}
            } as DOMRect);

            clickButton();
            const popover = getPopover()!;
            // offsetWidth = 0 in jsdom → pre-render branch: left = posRect.right
            expect(popover.style.left).toBe(`${mockRight}px`);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 16 — positionReference param is forwarded to PopoverBuilder
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 16: positionReference forwarded to PopoverBuilder', () => {
        test('when positionReference is provided, popover left uses positionReference rect.right, not button rect.right', () => {
            const currencies = ['USD', 'EUR'];
            const currencyValue$ = new Subject<string | null>();
            const enabled$ = new BehaviorSubject<boolean>(true);

            // Create a position reference with a known, distinct right edge
            const posRef = document.createElement('div');
            const posRefRight = 500;
            posRef.getBoundingClientRect = () => ({
                top: 50, bottom: 80, left: 100, right: posRefRight,
                width: 400, height: 30, x: 100, y: 50, toJSON: () => {}
            } as DOMRect);
            document.body.appendChild(posRef);

            const container = createCurrencyDropdown(currencies, currencyValue$, enabled$, false, posRef);
            document.body.appendChild(container);

            const button = container.querySelector('button') as HTMLButtonElement;
            // Give button a different right than posRef
            button.getBoundingClientRect = () => ({
                top: 50, bottom: 80, left: 400, right: 450,
                width: 50, height: 30, x: 400, y: 50, toJSON: () => {}
            } as DOMRect);

            button.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            const popover = document.body.querySelector('[popover]') as HTMLElement;
            expect(popover).not.toBeNull();

            // end alignment, offsetWidth=0 (jsdom) → pre-render: left = posRef.right = 500
            expect(popover.style.left).toBe(`${posRefRight}px`);
            expect(popover.style.right).toBe('');

            // Must NOT equal the button-based left (450)
            expect(popover.style.left).not.toBe('450px');
        });

        test('when positionReference is omitted, popover left falls back to button rect.right', () => {
            const { button, clickButton, getPopover } = makeSetup({ currencies: ['USD', 'EUR'] });
            const mockRight = 300;
            button.getBoundingClientRect = () => ({
                top: 50, bottom: 80, left: 250, right: mockRight,
                width: 50, height: 30, x: 250, y: 50, toJSON: () => {}
            } as DOMRect);

            clickButton();

            const popover = getPopover()!;
            // offsetWidth=0 (jsdom) → pre-render: left = button.right = 300
            expect(popover.style.left).toBe(`${mockRight}px`);
            expect(popover.style.right).toBe('');
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 13 — no manual click/scroll/resize listeners in the component
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 13: no manual event listeners in currency-dropdown (PopoverBuilder handles them)', () => {
        test('currency-dropdown source does not add click listeners to document or window', () => {
            // We verify indirectly: PopoverBuilder registers these listeners during show().
            // The currency-dropdown source file itself must not call document.addEventListener('click')
            // or window.addEventListener. We inspect the source file contents.
            // This test reads the compiled module source to confirm the absence.
            const fs: typeof import('fs') = require('fs');
            const src: string = fs.readFileSync(
                require.resolve('./currency-dropdown'),
                'utf-8'
            );
            // Should not contain raw document.addEventListener or window.addEventListener calls
            // (those belong in PopoverBuilder)
            expect(src).not.toMatch(/document\.addEventListener\s*\(\s*['"]click['"]/);
            expect(src).not.toMatch(/document\.addEventListener\s*\(\s*['"]scroll['"]/);
            expect(src).not.toMatch(/window\.addEventListener\s*\(\s*['"]resize['"]/);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Spec 14 — renderItems() called before popover.show()
    // ──────────────────────────────────────────────────────────────────────────
    describe('Spec 14: renderItems() is called before popover.show() in openDropdown()', () => {
        test('list items are already in the DOM when the popover becomes visible', () => {
            // We intercept showPopover to inspect DOM state at the moment it's called
            let itemCountAtShowTime = -1;
            const origShow = HTMLElement.prototype.showPopover;
            HTMLElement.prototype.showPopover = function () {
                // Count li[role="option"] inside the popover at this point
                itemCountAtShowTime = this.querySelectorAll('li[role="option"]').length;
                origShow?.call(this);
            };

            const { clickButton } = makeSetup({ currencies: ['USD', 'EUR', 'GBP'] });
            clickButton();

            HTMLElement.prototype.showPopover = origShow;

            expect(itemCountAtShowTime).toBe(3);
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // Additional structural tests
    // ──────────────────────────────────────────────────────────────────────────
    describe('structural / DOM integrity', () => {
        test('button has aria-haspopup="listbox"', () => {
            const { button } = makeSetup();
            expect(button.getAttribute('aria-haspopup')).toBe('listbox');
        });

        test('button aria-controls points to listbox id', () => {
            const { button, clickButton, getListbox } = makeSetup();
            clickButton();
            const listboxId = getListbox()!.id;
            expect(button.getAttribute('aria-controls')).toBe(listboxId);
        });

        test('listbox has role="listbox"', () => {
            const { clickButton, getListbox } = makeSetup();
            clickButton();
            expect(getListbox()!.getAttribute('role')).toBe('listbox');
        });

        test('each option li has role="option"', () => {
            const { clickButton, getItems } = makeSetup({ currencies: ['USD', 'EUR'] });
            clickButton();
            const items = getItems();
            expect(items.length).toBe(2);
            items.forEach(li => expect(li.getAttribute('role')).toBe('option'));
        });

        test('container has currency-dropdown class', () => {
            const { container } = makeSetup();
            expect(container.classList.contains('currency-dropdown')).toBe(true);
        });

        test('symbol span shows symbol for first currency by default', () => {
            const { container } = makeSetup({ currencies: ['EUR', 'USD'] });
            const span = container.querySelector('span');
            expect(span?.textContent).toBe('€');
        });

        test('currencyValue$ emission updates the symbol span', () => {
            const { container, currencyValue$ } = makeSetup({ currencies: ['USD', 'EUR'] });
            currencyValue$.next('EUR');
            const span = container.querySelector('span');
            expect(span?.textContent).toBe('€');
        });
    });
});
