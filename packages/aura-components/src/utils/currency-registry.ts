import { Money } from '../components/grid/types';

export class CurrencyRegistry {
    private static symbols: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥',
        'RUB': '₽',
        'KRW': '₩',
        'INR': '₹',
        'TRY': '₺',
        'ILS': '₪',
        'ETH': 'Ξ',
        'BTC': '₿',
    };

    /**
     * Get currency symbol for a given currency ID.
     * Falls back to the currency ID if symbol is not found.
     */
    static getSymbol(currencyId: string): string {
        return this.symbols[currencyId.toUpperCase()] || currencyId;
    }

    /**
     * Formats a Money object into a localized string.
     */
    static format(money: Money): string {
        if (!money || typeof money.amount !== 'number') return '';
        
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: money.currencyId.toUpperCase(),
                currencyDisplay: 'symbol'
            }).format(money.amount);
        } catch (e) {
            // Fallback for unknown currencies or invalid currency codes
            const symbol = this.getSymbol(money.currencyId);
            return `${symbol}${money.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
    }

    /**
     * Register or override a currency symbol.
     */
    static register(currencyId: string, symbol: string): void {
        this.symbols[currencyId.toUpperCase()] = symbol;
    }
}
