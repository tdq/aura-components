# Material Design 3 Theme (Fixed Tokens)

All UI must strictly follow these tokens.  
Do NOT use hardcoded colors, sizes, or radii outside this file.

## 1. Color System

Seed: #6750A4

### Light Theme

primary: #6750A4  
onPrimary: #FFFFFF  
primaryContainer: #EADDFF  
onPrimaryContainer: #21005D  

secondary: #625B71  
onSecondary: #FFFFFF  
secondaryContainer: #E8DEF8  
onSecondaryContainer: #1D192B  

tertiary: #7D5260  
onTertiary: #FFFFFF  
tertiaryContainer: #FFD8E4  
onTertiaryContainer: #31111D  

background: #FFFBFE  
onBackground: #1C1B1F  

surface: #FFFBFE  
onSurface: #1C1B1F  
surfaceVariant: #E7E0EC  
onSurfaceVariant: #49454F  

outline: #79747E  
error: #B3261E  
onError: #FFFFFF  

### Dark Theme

primary: #D0BCFF  
onPrimary: #381E72  
primaryContainer: #4F378B  
onPrimaryContainer: #EADDFF  

secondary: #CCC2DC  
onSecondary: #332D41  
secondaryContainer: #4A4458  
onSecondaryContainer: #E8DEF8  

tertiary: #EFB8C8  
onTertiary: #492532  
tertiaryContainer: #633B48  
onTertiaryContainer: #FFD8E4  

background: #1C1B1F  
onBackground: #E6E1E5  

surface: #1C1B1F  
onSurface: #E6E1E5  
surfaceVariant: #49454F  
onSurfaceVariant: #CAC4D0  

outline: #938F99  
error: #F2B8B5  
onError: #601410  

## 2. State Layers (Opacity Tokens)

Hover: 0.08
Focus: 0.12
Pressed: 0.12
Dragged: 0.16

State layers must use the foreground color with these opacities.
Do NOT introduce custom opacity values.

## 3. Typography (MD3 Scale)

Font: Roboto, system-ui, sans-serif

Format: font-size / line-height / font-weight

displayLarge: 57px / 64px / 400
headlineLarge: 32px / 40px / 400
headlineMedium: 28px / 36px / 400
titleLarge: 22px / 28px / 400
titleMedium: 16px / 24px / 500
titleSmall: 14px / 20px / 500

bodyLarge: 16px / 24px / 400
bodyMedium: 14px / 20px / 400

labelLarge: 16px / 24px / 500
labelMedium: 14px / 20px / 500
labelSmall: 12px / 16px / 500

Letter spacing must follow Material 3 defaults:

labelLarge: 0.1px
labelMedium: 0.5px
labelSmall: 0.5px

## 4. Shape

small: 4px  
medium: 8px  
large: 16px  
extraLarge: 28px  

Buttons: medium  
Cards: medium  
Dialogs: large  
Bottom Sheets: extraLarge (top corners only)

No other radius values allowed.

## 5. Spacing (4px Grid)

4  
8  
12  
16  
24  
32  
40  
48  

No other spacing values allowed.

## 6. Elevation

level0: none  
level1: 1dp  
level2: 3dp  
level3: 6dp  
level4: 8dp  
level5: 12dp  

Prefer tonal elevation over heavy shadows.

## 7. Component Rules

Minimum touch target: 48px  

Buttons:
- Primary action: Filled
- Secondary: Filled Tonal
- Tertiary: Outlined
- Low emphasis: Text

Icons:
- Material Symbols
- Default size: 24px

## 8. Accessibility

Minimum contrast: WCAG AA  
Touch target ≥ 48px  
No color-only meaning  