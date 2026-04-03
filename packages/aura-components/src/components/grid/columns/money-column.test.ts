import { MoneyColumnBuilder } from './money-column';
import { Money } from '../types';

describe('MoneyColumnBuilder', () => {
    it('should render a Money object using CurrencyRegistry', () => {
        const builder = new MoneyColumnBuilder<any>('price');
        const item = {
            price: { amount: 100, currencyId: 'USD' } as Money
        };
        
        const rendered = builder.render(item);
        // It should contain $ and 100.
        expect(rendered).toContain('$');
        expect(rendered).toContain('100.00');
    });

    it('should return empty string if value is missing', () => {
        const builder = new MoneyColumnBuilder<any>('price');
        const item = {};
        
        const rendered = builder.render(item);
        expect(rendered).toBe('');
    });

    it('should handle different currencies', () => {
        const builder = new MoneyColumnBuilder<any>('price');
        const item = {
            price: { amount: 50, currencyId: 'EUR' } as Money
        };
        
        const rendered = builder.render(item);
        expect(rendered).toContain('€');
        expect(rendered).toContain('50.00');
    });
});
