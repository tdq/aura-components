import { Observable, Subject, Subscription } from 'rxjs';
import { CurrencyRegistry } from '@/utils/currency-registry';
import { Icons } from '@/core/icons';
import { registerDestroy } from '@/core/destroyable-element';
import { PopoverBuilder } from '../component-parts/popover';

let dropdownIdCounter = 0;

// Fix 3: Hoisted to module scope — constructed at most once per process lifetime
let currencyDisplayNames: Intl.DisplayNames | null = null;
function getCurrencyDisplayName(currencyId: string): string {
    try {
        if (!currencyDisplayNames) {
            currencyDisplayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
        }
        return currencyDisplayNames.of(currencyId.toUpperCase()) || currencyId;
    } catch {
        return currencyId;
    }
}

function createChevronIcon(): HTMLElement {
    const icon = document.createElement('span');
    icon.innerHTML = Icons.CHEVRON_DOWN;
    const svg = icon.querySelector('svg');
    if (svg) {
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.style.display = 'block';
    }
    return icon;
}

export function createCurrencyDropdown(
    currencies: string[],
    currencyValue$: Subject<string | null>,
    enabled$: Observable<boolean>,
    isGlass: boolean,
    positionReference?: HTMLElement
): HTMLElement {
    const subscriptions = new Subscription();

    const listId = `currency-listbox-${++dropdownIdCounter}`;
    let isOpen = false;
    let focusedIndex = -1;
    let currentCurrency: string | null = null;
    // Fix 4: Keep references to <li> elements to avoid full re-render on focus change
    let liElements: HTMLLIElement[] = [];

    // Root container
    const container = document.createElement('div');
    container.className = 'currency-dropdown flex items-center h-full';

    // Trigger button
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', listId);
    button.className = [
        'flex', 'items-center', 'gap-1', 'px-1', 'h-full',
        'cursor-pointer', 'bg-transparent', 'border-0', 'outline-none',
        'focus-visible:ring-2', 'focus-visible:ring-primary', 'rounded-sm'
    ].join(' ');

    // Currency symbol span
    const symbolSpan = document.createElement('span');
    symbolSpan.className = isGlass
        ? 'body-large text-white/80 select-none'
        : 'body-large text-on-surface-variant select-none';

    // Chevron icon
    const chevron = createChevronIcon();
    chevron.className = isGlass ? 'text-white/80' : 'text-on-surface-variant';

    button.appendChild(symbolSpan);
    button.appendChild(chevron);
    container.appendChild(button);

    // Dropdown list — content element for PopoverBuilder
    const listbox = document.createElement('ul');
    listbox.id = listId;
    listbox.setAttribute('role', 'listbox');
    listbox.className = 'py-2';

    // PopoverBuilder manages DOM attachment, positioning, and all close events
    const popover = new PopoverBuilder()
        .withAnchor(button)
        .withContent({ build: () => listbox })
        .withWidth('auto')
        .withAlignment('end')
        .withMaxWidth('300px')
        .withOnClose(() => {
            isOpen = false;
            focusedIndex = -1;
            button.setAttribute('aria-expanded', 'false');
            button.removeAttribute('aria-activedescendant');
        });

    if (positionReference) {
        popover.withPositionReference(positionReference);
    }

    if (isGlass) {
        popover.asGlass();
    } else {
        popover.withClass('bg-surface border border-outline');
    }

    // Fix 4: Build list items and populate liElements; called on open and on selection change
    function renderItems() {
        listbox.innerHTML = '';
        liElements = [];
        currencies.forEach((currencyId, index) => {
            const symbol = CurrencyRegistry.getSymbol(currencyId);
            const name = getCurrencyDisplayName(currencyId);
            const isSelected = currencyId === currentCurrency;
            const isFocused = index === focusedIndex;

            const li = document.createElement('li');
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', isSelected.toString());
            // Fix 2: id for aria-activedescendant
            li.id = `${listId}-opt-${index}`;

            const classes = [
                'px-4', 'py-3', 'cursor-pointer', 'body-large', 'text-on-surface', 'whitespace-nowrap'
            ];
            if (isSelected) {
                classes.push('bg-primary-container', 'text-on-primary-container', 'font-semibold');
            } else if (isFocused) {
                classes.push('bg-on-surface/12');
            } else {
                classes.push('hover:bg-on-surface/12');
            }
            li.className = classes.join(' ');
            li.textContent = `${symbol} ${name}`;

            li.onclick = () => {
                currencyValue$.next(currencyId);
                closeDropdown();
            };

            listbox.appendChild(li);
            liElements.push(li);
        });
    }

    // Fix 4: Incremental focus update — no DOM rebuild needed
    function updateFocusedItem(oldIndex: number, newIndex: number) {
        if (oldIndex >= 0 && oldIndex < liElements.length) {
            const old = liElements[oldIndex];
            const oldIsSelected = currencies[oldIndex] === currentCurrency;
            if (!oldIsSelected) {
                old.classList.remove('bg-on-surface/12');
                old.classList.add('hover:bg-on-surface/12');
            }
        }
        if (newIndex >= 0 && newIndex < liElements.length) {
            const next = liElements[newIndex];
            const newIsSelected = currencies[newIndex] === currentCurrency;
            if (!newIsSelected) {
                next.classList.remove('hover:bg-on-surface/12');
                next.classList.add('bg-on-surface/12');
            }
            button.setAttribute('aria-activedescendant', `${listId}-opt-${newIndex}`);
            next.scrollIntoView({ block: 'nearest' });
        }
    }

    function openDropdown() {
        if (isOpen) return;
        isOpen = true;
        focusedIndex = currencies.indexOf(currentCurrency || '');
        if (focusedIndex < 0) focusedIndex = 0;
        renderItems();
        popover.show();
        button.setAttribute('aria-expanded', 'true');
        // Fix 2: set initial aria-activedescendant
        if (focusedIndex >= 0 && focusedIndex < currencies.length) {
            button.setAttribute('aria-activedescendant', `${listId}-opt-${focusedIndex}`);
        }
    }

    function closeDropdown() {
        if (!isOpen) return;
        popover.close();
        // State reset happens in withOnClose callback
    }

    function toggleDropdown() {
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }

    function moveFocus(delta: number) {
        if (!isOpen) return;
        const oldIndex = focusedIndex;
        focusedIndex = Math.max(0, Math.min(currencies.length - 1, focusedIndex + delta));
        // Fix 4: incremental update instead of full re-render
        updateFocusedItem(oldIndex, focusedIndex);
    }

    function selectFocused() {
        if (!isOpen || focusedIndex < 0 || focusedIndex >= currencies.length) return;
        currencyValue$.next(currencies[focusedIndex]);
        closeDropdown();
    }

    // Button click
    button.onclick = (e) => {
        e.stopPropagation();
        toggleDropdown();
    };

    // Fix 1: ArrowDown/Up/Space open the dropdown when closed; existing switch handles open state
    button.onkeydown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ') {
                e.preventDefault();
                openDropdown();
            }
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                moveFocus(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                moveFocus(-1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                selectFocused();
                break;
            case 'Escape':
                e.preventDefault();
                closeDropdown();
                break;
        }
    };

    // Subscribe to currency value changes to update the displayed symbol
    subscriptions.add(
        currencyValue$.subscribe(currencyId => {
            currentCurrency = currencyId;
            if (currencyId) {
                symbolSpan.textContent = CurrencyRegistry.getSymbol(currencyId);
            } else if (currencies.length > 0) {
                symbolSpan.textContent = CurrencyRegistry.getSymbol(currencies[0]);
            }
        })
    );

    // Subscribe to enabled$ to toggle disabled state
    subscriptions.add(
        enabled$.subscribe(enabled => {
            if (enabled) {
                button.classList.remove('opacity-38', 'cursor-not-allowed', 'pointer-events-none');
            } else {
                button.classList.add('opacity-38', 'cursor-not-allowed', 'pointer-events-none');
                if (isOpen) closeDropdown();
            }
        })
    );

    // Initialize symbol display from first currency if no current value
    if (currencies.length > 0) {
        symbolSpan.textContent = CurrencyRegistry.getSymbol(currencies[0]);
    }

    // Cleanup — PopoverBuilder registers its own cleanup on the button element via registerDestroy,
    // so click/scroll/resize listeners and popover DOM removal are handled automatically.
    registerDestroy(container, () => {
        subscriptions.unsubscribe();
        if (isOpen) {
            popover.close();
        }
    });

    return container;
}
