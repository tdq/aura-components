import { MoneyFieldBuilder, MoneyFieldStyle, registerDestroy, Money } from 'aura-components';
import { of, BehaviorSubject } from 'rxjs';

export function createMoneyFieldDemo(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex-1 overflow-y-auto p-px-24 space-y-px-32';

    // Header
    const header = document.createElement('div');
    header.innerHTML = `
        <h1 class="text-headline-medium text-on-surface">Money Field</h1>
        <p class="text-body-large text-on-surface-variant">A specialized input component for currency values with support for multiple currencies, formatting, and validation.</p>
    `;
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 lg:grid-cols-2 gap-px-24';
    container.appendChild(grid);

    // 1. Basic usage - Single currency
    const basicSection = createDemoSection('Basic Usage', 'Single currency (EUR) with default formatting.');
    const basicValue$ = new BehaviorSubject<Money | null>({ amount: 1250.50, currencyId: 'EUR' });
    const basicField = new MoneyFieldBuilder()
        .withLabel(of('Account Balance'))
        .withValue(basicValue$)
        .withCurrencies(['EUR'])
        .build();
    basicSection.appendChild(basicField);
    grid.appendChild(basicSection);

    // 2. Multiple currencies
    const multiCurrencySection = createDemoSection('Multiple Currencies', 'Switch between different currencies.');
    const multiValue$ = new BehaviorSubject<Money | null>({ amount: 500, currencyId: 'USD' });
    const multiField = new MoneyFieldBuilder()
        .withLabel(of('Investment Amount'))
        .withValue(multiValue$)
        .withCurrencies(['USD', 'EUR', 'GBP', 'JPY'])
        .build();
    multiCurrencySection.appendChild(multiField);
    grid.appendChild(multiCurrencySection);

    // 3. Different Styles (Filled vs Outlined/Tonal)
    const styleSection = createDemoSection('Styles', 'Tonal (default) and Outlined variations.');
    const tonalField = new MoneyFieldBuilder()
        .withLabel(of('Tonal Style (Default)'))
        .withStyle(of(MoneyFieldStyle.TONAL))
        .withValue(new BehaviorSubject<Money | null>({ amount: 1000, currencyId: 'USD' }))
        .withCurrencies(['USD'])
        .build();
    
    const outlinedField = new MoneyFieldBuilder()
        .withLabel(of('Outlined Style'))
        .withStyle(of(MoneyFieldStyle.OUTLINED))
        .withValue(new BehaviorSubject<Money | null>({ amount: 2000, currencyId: 'EUR' }))
        .withCurrencies(['EUR'])
        .build();
    
    styleSection.appendChild(tonalField);
    styleSection.appendChild(outlinedField);
    grid.appendChild(styleSection);

    // 4. Glass Effect
    const glassSection = createDemoSection('Glass Effect', 'Modern glassmorphism look.');
    const glassValue$ = new BehaviorSubject<Money | null>({ amount: 75000, currencyId: 'USD' });
    const glassField = new MoneyFieldBuilder()
        .withLabel(of('Revenue (Glass)'))
        .withValue(glassValue$)
        .asGlass()
        .withCurrencies(['USD'])
        .build();
    glassSection.appendChild(glassField);
    grid.appendChild(glassSection);

    // 5. Validation & Errors
    const validationSection = createDemoSection('Validation', 'Min/Max limits and error states.');
    const errorValue$ = new BehaviorSubject<Money | null>({ amount: 50, currencyId: 'EUR' });
    const error$ = new BehaviorSubject<string>('');
    
    const validationField = new MoneyFieldBuilder()
        .withLabel(of('Withdrawal Amount (Min 100)'))
        .withValue(errorValue$)
        .withMinValue(of(100))
        .withError(error$)
        .withCurrencies(['EUR'])
        .build();
    
    const sub = errorValue$.subscribe(val => {
        if (val && val.amount < 100) {
            error$.next(`Minimum withdrawal amount is 100 ${val.currencyId}`);
        } else {
            error$.next('');
        }
    });
    registerDestroy(container, () => {
        sub.unsubscribe();
        error$.complete();
        errorValue$.complete();
        basicValue$.complete();
        multiValue$.complete();
        glassValue$.complete();
    });

    validationSection.appendChild(validationField);
    grid.appendChild(validationSection);

    // 6. Inline Error
    const inlineErrorSection = createDemoSection('Inline Error', 'Compact error display.');
    const inlineField = new MoneyFieldBuilder()
        .withLabel(of('Transfer Fee'))
        .withError(of('Invalid amount'))
        .asInlineError()
        .withCurrencies(['USD'])
        .build();
    inlineErrorSection.appendChild(inlineField);
    grid.appendChild(inlineErrorSection);

    // 7. Read-only / Disabled
    const disabledSection = createDemoSection('Disabled State', 'Field in disabled state.');
    const disabledField = new MoneyFieldBuilder()
        .withLabel(of('Locked Collateral'))
        .withValue(new BehaviorSubject<Money | null>({ amount: 1000000, currencyId: 'USD' }))
        .withEnabled(of(false))
        .withCurrencies(['USD'])
        .build();
    disabledSection.appendChild(disabledField);
    grid.appendChild(disabledSection);

    return container;
}

function createDemoSection(title: string, description: string): HTMLElement {
    const section = document.createElement('div');
    section.className = 'p-px-24 rounded-extra-large bg-surface-container-low border border-outline-variant flex flex-col gap-px-16';
    
    const header = document.createElement('div');
    header.innerHTML = `
        <h3 class="text-title-medium text-on-surface">${title}</h3>
        <p class="text-body-medium text-on-surface-variant">${description}</p>
    `;
    section.appendChild(header);
    
    return section;
}
