Button component is a custom element that is used to display a button.
It has the following methods:
- withCaption(caption: Observable<string>): ButtonBuilder - sets caption of the button.
- withEnabled(enabled: Observable<boolean>): ButtonBuilder - sets enabled state of the button.
- withClick(click: Subject<void>): ButtonBuilder - sets click event of the button.
- withStyle(style: Observable<ButtonStyle>): ButtonBuilder - sets style of the button.
- withClass(className: Observable<string>): ButtonBuilder - sets class css name of the button.

Button style is an enum with the following values:
- filled
- elevated
- tonal
- outlined
- text