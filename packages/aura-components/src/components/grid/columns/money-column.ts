import { BaseColumnBuilder } from './base-column-builder';
import { ColumnType, GridColumn, Money } from '../types';
import { CurrencyRegistry } from '../../../utils/currency-registry';

export class MoneyColumnBuilder<ITEM> extends BaseColumnBuilder<ITEM> {
    render(item: ITEM): string {
        const value = (item as any)[this._field] as Money;
        if (!value) return '';
        
        return CurrencyRegistry.format(value);
    }

    build(): GridColumn<ITEM> {
        this.withSortValue((item: ITEM) => (item as any)[this._field]?.amount);
        return this.createBaseColumn(ColumnType.MONEY);
    }
}
