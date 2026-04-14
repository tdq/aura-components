# Plan: Allow defining currencies in Money Column editor

**Date**: 2026-04-13
**Task**: Update MoneyColumnBuilder to allow defining available currencies for its editor.

## Subtasks

- [x] 1. Add `withCurrencies` to `MoneyColumnBuilder` — aura-components-dev — Add private property and public builder method
- [x] 2. Update `MoneyColumnBuilder.createEditor` — aura-components-dev — Pass currencies to `MoneyFieldBuilder`
- [x] 3. Code review: MoneyColumn currencies support — code-reviewer
- [x] 4. QA: Validate MoneyColumn currencies in editor — qa-tester
- [x] 5. Update documentation — aura-components-docs — Update `money-column.md`
