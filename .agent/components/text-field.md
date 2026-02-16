TextField component is a component that allows the user to enter and edit text.
It has the folowing methods:
- withValue(value: Subject<string>): TextBuilder - sets value of the text field.
- withPlaceholder(placeholder: Observable<string>): TextBuilder - sets placeholder of the text field.
- withEnabled(enabled: Observable<boolean>): TextBuilder - sets enabled state of the text field.
- withStyle(style: Observable<ButtonStyle>): TextBuilder - sets style of the text field.
- withError(error: Observable<string>): TextBuilder - sets error of the text field.
- withLabel(label: Observable<string>): TextBuilder - sets label of the text field.
- withClass(className: Observable<string>): TextBuilder - sets class css name of the text field.

## Style
Style according to Material Design 3 
Error and label are small text.
Border should be defined as outline so changing its size is not affecting size of the input.