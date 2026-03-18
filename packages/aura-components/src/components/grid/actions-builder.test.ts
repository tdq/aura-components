import { Icons } from '@/core/icons';
import { ActionsBuilder } from './actions-builder';

describe('ActionsBuilder', () => {
    let onClick: jest.Mock;

    beforeEach(() => {
        onClick = jest.fn();
    });

    it('should add an action with icon, label, and onClick', () => {
        const builder = new ActionsBuilder<any>();
        builder.addAction(Icons.EDIT, 'Edit', onClick);
        const actions = builder.build();

        expect(actions.length).toBe(1);
        expect(actions[0].icon).toBe(Icons.EDIT);
        expect(actions[0].label).toBe('Edit');
        expect(actions[0].onClick).toBe(onClick);
    });

    it('should return all added actions from build()', () => {
        const onClick2 = jest.fn();
        const builder = new ActionsBuilder<any>();
        builder.addAction(Icons.EDIT, 'Edit', onClick);
        builder.addAction(Icons.DELETE, 'Delete', onClick2);
        const actions = builder.build();

        expect(actions.length).toBe(2);
        expect(actions[0].icon).toBe(Icons.EDIT);
        expect(actions[1].icon).toBe(Icons.DELETE);
    });

    it('should return a defensive copy from build()', () => {
        const builder = new ActionsBuilder<any>();
        builder.addAction(Icons.EDIT, 'Edit', onClick);

        const first = builder.build();
        first.push({ icon: Icons.DELETE, label: 'Delete', onClick });

        const second = builder.build();
        expect(second.length).toBe(1);
    });

    it('should throw when icon is an empty string', () => {
        const builder = new ActionsBuilder<any>();
        expect(() => builder.addAction('', 'Edit', onClick)).toThrow();
    });

    it('should throw when icon is whitespace-only', () => {
        const builder = new ActionsBuilder<any>();
        expect(() => builder.addAction('   ', 'Edit', onClick)).toThrow();
    });

    it('should throw when label is an empty string', () => {
        const builder = new ActionsBuilder<any>();
        expect(() => builder.addAction(Icons.EDIT, '', onClick)).toThrow();
    });

    it('should throw when label is whitespace-only', () => {
        const builder = new ActionsBuilder<any>();
        expect(() => builder.addAction(Icons.EDIT, '   ', onClick)).toThrow();
    });

    it('should support fluent chaining — addAction returns this', () => {
        const onClick2 = jest.fn();
        const builder = new ActionsBuilder<any>();
        const result = builder
            .addAction(Icons.EDIT, 'Edit', onClick)
            .addAction(Icons.DELETE, 'Delete', onClick2);

        expect(result).toBe(builder);
        expect(builder.build().length).toBe(2);
    });
});
