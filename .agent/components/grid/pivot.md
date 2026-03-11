# Pivot Feature

## Description
The Pivot feature allows the Grid to transform flat data into an aggregated multi-dimensional table. It dynamically generates columns and calculates values based on a `PivotConfig`.

## Pivot Configuration
The `PivotConfig` interface defines the transformation logic:
- `rows: string[]`: Fields to use for row grouping.
- `columns: string[]`: Fields to use for dynamic column generation.
- `values: PivotValueConfig[]`: Aggregation rules.
    - `field: string`: The numeric field to aggregate.
    - `aggregation: 'SUM' | 'COUNT' | 'AVG' | 'MIN' | 'MAX'`: The function to apply.
    - `header?: string`: Custom label for the aggregated column.
- `showGrandTotal?: boolean`: Enables row and column totals.

## Builder Methods
- `withPivot(config: PivotConfig): this`: Enables and configures the pivoting mode on the `GridBuilder`.

## Implementation Details
- **Data Transformation**: The `PivotLogic` utility processes the raw `ITEM[]` array and produces a `PivotedRow[]` where each object contains row fields and dynamic value fields.
- **Dynamic Columns**: Columns are generated at runtime by scanning the dataset for unique values in the `columns` fields. These dynamic columns are then injected into the grid's column set.
- **Reactivity**: The pivot transformation is part of the `GridLogic` state pipeline. Any change in the source data triggers a re-pivot and potentially a re-generation of dynamic columns.

## Performance
- **Aggregation**: Pivoting involves multiple passes over the data. For large datasets, this occurs within the `GridLogic` and leverages RxJS to avoid blocking the main thread during simple updates.
- **Virtualization**: The resulting `PivotedRow` objects are rendered using the same virtualization engine as regular rows, ensuring high performance even with many aggregated rows.

## Styling
- **Totals**: Pivot tables often include "Total" rows and columns. These are styled using `GridStyles.totalCell` to differentiate them from standard data.
- **Alignment**: Aggregated numeric values are automatically right-aligned.
