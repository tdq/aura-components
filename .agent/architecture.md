## Monorepo structure

```
packages/
├── aura-components/       # Core UI component library (published as "aura-components")
│   ├── src/
│   │   ├── components/    # One directory per component (button, chart, grid, …)
│   │   │   └── <name>/
│   │   │       ├── index.ts
│   │   │       ├── <name>.ts       # Builder class (e.g. ButtonBuilder)
│   │   │       └── *.ts            # Supporting files (types, styles, logic, …)
│   │   ├── core/          # ComponentBuilder base, icons, destroyable-element
│   │   ├── theme/         # ThemeManager and types
│   │   ├── types/         # Shared domain types used across multiple components (e.g. Money for Grid and MoneyField)
│   │   └── utils/         # Shared utilities
│   ├── scripts/
│   │   ├── reorganize-types.mjs   # Post-build: moves dist/components/* → dist/*
│   │   └── generate-manifest.mjs  # Post-build: generates dist/component-manifest.json
│   └── dist/              # Build output (committed for local consumption)
│       ├── index.d.ts             # Re-exports all components (paths updated by reorganize-types)
│       ├── index.js
│       ├── <component>/           # Per-component entry (button/, chart/, grid/, …)
│       │   ├── index.js
│       │   ├── index.d.ts
│       │   └── <name>.d.ts        # Actual class definitions
│       └── component-manifest.json  # Generated registry consumed by MCP server
│
├── mcp-server/            # MCP server exposing aura-components to AI tools
│   └── src/
│       ├── index.ts               # McpServer wiring (list_components, get_component_api, get_usage_example)
│       ├── manifest.ts            # Reads dist/component-manifest.json from aura-components package
│       └── tools/
│           ├── list-components.ts
│           ├── get-component-api.ts
│           └── get-usage-example.ts
│
├── stories/               # Storybook stories (dev / demo only)
└── examples/              # Usage examples
```

## Build pipeline (aura-components)

```
npm run build
  └─ vite build               → dist/*.js  (JS bundles + per-component entries)
  └─ build:css                → dist/a1-components.css
  └─ build:types (tsc)        → dist/components/**/*.d.ts  +  dist/index.d.ts
                                  (index.d.ts references ./components/<name>)
  └─ reorganize-types.mjs     → moves dist/components/<name>/ → dist/<name>/
                                  rewrites relative imports in all moved .d.ts files
                                  rewrites imports in root-level .d.ts files (e.g. index.d.ts)
                                  removes dist/components/
  └─ generate-manifest.mjs    → reads updated dist/index.d.ts,
                                  scans all .d.ts files in each component directory,
                                  extracts *Builder / *Component classes and their public methods,
                                  writes dist/component-manifest.json
```

## component-manifest.json schema

```jsonc
{
  "version": "0.1.1",
  "generatedAt": "ISO timestamp",
  "components": [
    {
      "name": "ButtonBuilder",          // class name
      "componentName": "button",        // lowercase, used as sub-path import key
      "description": "Builder for the button component",
      "import": "aura-components/button",
      "methods": ["withCaption", "withIcon", "withEnabled", "withClick", "withStyle", "build"],
      "example": "import { ButtonBuilder } from 'aura-components/button';\n\nconst el = new ButtonBuilder().build();\ndocument.body.appendChild(el);"
    }
  ]
}
```

## MCP server tools

| Tool | Description |
|------|-------------|
| `list_components` | Returns all components (name, componentName, description, import) |
| `get_component_api` | Returns full component entry including methods; accepts class name or componentName |
| `get_usage_example` | Returns name + example snippet; accepts class name or componentName |
