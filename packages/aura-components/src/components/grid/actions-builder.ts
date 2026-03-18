import { GridAction } from './types';

export class ActionsBuilder<ITEM> {
    private actions: GridAction<ITEM>[] = [];

    addAction(icon: string, label: string, onClick: (item: ITEM) => void): this {
        if (typeof icon !== 'string' || !icon.trim()) throw new Error('ActionsBuilder.addAction: icon SVG is required');
        if (!icon.trim().startsWith('<svg')) throw new Error('ActionsBuilder.addAction: icon must be an SVG string');
        if (typeof label !== 'string' || !label.trim()) throw new Error('ActionsBuilder.addAction: label must be a non-empty string');
        this.actions.push({ icon, label, onClick });
        return this;
    }

    build(): GridAction<ITEM>[] {
        return [...this.actions];
    }
}
