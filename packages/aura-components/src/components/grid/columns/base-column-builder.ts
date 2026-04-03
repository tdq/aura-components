import { ColumnBuilder, GridColumn, ColumnType } from '../types';

export abstract class BaseColumnBuilder<ITEM> implements ColumnBuilder<ITEM> {
    protected _header: string = '';
    protected _width: string = '1fr';
    protected _sortable: boolean = false;
    protected _resizable: boolean = false;
    protected _editable: boolean = false;
    protected _field: string;
    protected _cellClass?: (item: ITEM) => string;
    protected _onEdit?: (item: ITEM, field: keyof ITEM | string, newValue: string) => void;
    protected _sortValue?: (item: ITEM) => any;

    constructor(field: string) {
        this._field = field;
        this._header = field; // Default header to field name
    }

    withHeader(header: string): this {
        this._header = header;
        return this;
    }

    withWidth(width: string): this {
        this._width = width;
        return this;
    }

    asSortable(sortable: boolean = true): this {
        this._sortable = sortable;
        return this;
    }

    asResizable(resizable: boolean = true): this {
        this._resizable = resizable;
        return this;
    }

    asEditable(onEdit: (item: ITEM, field: keyof ITEM | string, newValue: string) => void): this {
        this._editable = true;
        this._onEdit = onEdit;
        return this;
    }

    withClass(classProvider: (item: ITEM) => string): this {
        this._cellClass = classProvider;
        return this;
    }

    withSortValue(provider: (item: ITEM) => any): this {
        this._sortValue = provider;
        return this;
    }

    abstract build(): GridColumn<ITEM>;

    protected createBaseColumn(type: ColumnType): GridColumn<ITEM> {
        return {
            id: this._field, // Simple ID generation
            field: this._field,
            type: type,
            header: this._header,
            width: this._width,
            sortable: this._sortable,
            resizable: this._resizable,
            editable: this._editable,
            cellClass: this._cellClass,
            render: (item: ITEM) => this.render(item),
            onEdit: this._onEdit,
            sortValue: this._sortValue
        };
    }

    protected abstract render(item: ITEM): HTMLElement | string;
}
