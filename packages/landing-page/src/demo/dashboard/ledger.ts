import { PanelBuilder, PanelGap, GridBuilder, LabelBuilder, LayoutBuilder, LayoutGap, SlotSize, Money } from '@tdq/ora-components';
import { of } from 'rxjs';
import { KPICardBuilder } from './kpi-card';

interface LedgerEntry {
    date: string;
    account: string;
    description: string;
    reference: string;
    debit: Money;
    credit: Money;
    balance: Money;
}

const generateLedgerData = (count: number): LedgerEntry[] => {
    const data: LedgerEntry[] = [];
    let runningBalance = 81400.00;
    const accounts = ['Cash & Bank', 'Revenue / SaaS Subscriptions', 'Accounts Receivable', 'Expenses / Payroll', 'Expenses / Office Rent', 'Revenue / Professional Services', 'Expenses / SaaS Tools', 'Accounts Payable', 'Revenue / Add-ons', 'Expenses / Marketing'];

    for (let i = 0; i < count; i++) {
        const amount = Math.floor(Math.random() * 500000) / 100;
        const isDebit = Math.random() > 0.5;
        const entry: LedgerEntry = {
            date: `2026-04-${String((i % 30) + 1).padStart(2, '0')}`,
            account: accounts[i % accounts.length],
            description: `Auto-generated entry ${i + 1}`,
            reference: `AUTO-${i + 1}`,
            debit: { amount: isDebit ? amount : 0, currencyId: 'EUR' },
            credit: { amount: isDebit ? 0 : amount, currencyId: 'EUR' },
            balance: { amount: runningBalance += (isDebit ? -amount : amount), currencyId: 'EUR' }
        };
        data.push(entry);
    }
    return data;
};

const LEDGER_DATA = generateLedgerData(10000);


function fmt(amount: number): string {
    return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function createSummaryStats(): HTMLElement {
    const totalDebits  = LEDGER_DATA.reduce((s, e) => s + e.debit.amount, 0);
    const totalCredits = LEDGER_DATA.reduce((s, e) => s + e.credit.amount, 0);
    const netBalance   = totalCredits - totalDebits;

    const stats = [
        { label: 'Total Debits',  value: fmt(totalDebits) },
        { label: 'Total Credits', value: fmt(totalCredits) },
        { label: 'Net Balance',   value: fmt(Math.abs(netBalance)) },
        { label: 'Entries',       value: String(LEDGER_DATA.length) },
    ];

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px-16 mb-px-24';

    stats.forEach(s => {
        const card = new KPICardBuilder()
            .withLabel(of(s.label))
            .withValue(of(s.value))
            .build();
        grid.appendChild(card);
    });

    return grid;
}

export function createLedger(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex-1 flex flex-col p-px-24';

    container.appendChild(createSummaryStats());

    const grid = new GridBuilder<LedgerEntry>()
        .withItems(of(LEDGER_DATA));
    const cols = grid.withColumns();
    cols.addTextColumn('date').withHeader('Date').withWidth('110px');
    cols.addTextColumn('account').withHeader('Account').withWidth('1fr');
    cols.addTextColumn('description').withHeader('Description').withWidth('1fr');
    cols.addTextColumn('reference').withHeader('Ref').withWidth('90px');
    cols.addMoneyColumn('debit').withHeader('Debit (€)').withWidth('110px');
    cols.addMoneyColumn('credit').withHeader('Credit (€)').withWidth('110px');
    cols.addMoneyColumn('balance').withHeader('Balance (€)').withWidth('120px');

    const layout = new LayoutBuilder()
        .asVertical()
        .withGap(LayoutGap.LARGE)
        .withClass(of('h-full'));
    layout.addSlot().withContent(new LabelBuilder().withCaption(of('General Ledger — April 2026')));
    layout.addSlot().withContent(grid).withSize(SlotSize.FULL);

    const panel = new PanelBuilder()
        .withContent(layout)
        .withGap(PanelGap.LARGE)
        .build();
    panel.classList.add('flex', 'flex-col', 'flex-1', 'min-h-0');
    container.appendChild(panel);

    return container;
}
