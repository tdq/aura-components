# Money Column

## Description
The `MoneyColumnBuilder` formats monetary data using the `Money` object and `CurrencyRegistry`.

## Builder Methods
In addition to [BaseColumnBuilder](grid.md#basecolumnbuilder-shared-methods) methods:
(No specific methods, as currency is part of the data object)

## Implementation Details
- **Field**: Expects a `Money` object: `{ amount: number; currencyId: string; }`.
- **Rendering**: Uses `CurrencyRegistry` which utilizes `Intl.NumberFormat` for localized formatting based on the `currencyId`.

## Styling
- **Alignment**: Right-aligned is recommended.
