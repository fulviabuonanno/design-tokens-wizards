# 🏗️ Arquitectura del Plugin de Figma

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    Design Tokens Wizards                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐          ┌──────────────────────┐
│   CLI Wizard         │          │   Figma Plugin       │
│   (color_wiz.js)     │          │                      │
│                      │          │                      │
│  ┌────────────────┐  │          │  ┌────────────────┐  │
│  │  Inquirer UI   │  │          │  │   HTML UI      │  │
│  │  (Terminal)    │  │          │  │   (Browser)    │  │
│  └────────────────┘  │          │  └────────────────┘  │
│          ↓           │          │          ↓           │
│  ┌────────────────┐  │          │  ┌────────────────┐  │
│  │  File System   │  │          │  │  Figma API     │  │
│  │  (JSON/CSS/    │  │          │  │  (Paint        │  │
│  │   SCSS)        │  │          │  │   Styles)      │  │
│  └────────────────┘  │          │  └────────────────┘  │
└──────────────────────┘          └──────────────────────┘
         │                                   │
         │                                   │
         └────────────┬──────────────────────┘
                      ↓
         ┌─────────────────────────┐
         │   Core Color Module     │
         │  (colorGenerator.js)    │
         │                         │
         │  • generateStops*()     │
         │  • calculateMiddleKeys()│
         │  • hexToRgb()          │
         │  • Color constants     │
         └─────────────────────────┘
```

## 🔄 Flujo de Datos: Plugin de Figma

```
┌──────────────┐
│   Usuario    │
└──────────────┘
       │
       │ 1. Interacción (clicks, input)
       ↓
┌──────────────────────────────────────────┐
│          UI (ui.html)                    │
│  ┌────────────────────────────────────┐  │
│  │  • Formularios                     │  │
│  │  • Color picker                    │  │
│  │  • Botones                         │  │
│  │  • Preview                         │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
       │
       │ 2. postMessage
       │    { type: 'generate-preview', config: {...} }
       ↓
┌──────────────────────────────────────────┐
│      Plugin Code (code.ts)               │
│  ┌────────────────────────────────────┐  │
│  │  figma.ui.onmessage handler        │  │
│  └────────────────────────────────────┘  │
│               │                          │
│               │ 3. Procesa config        │
│               ↓                          │
│  ┌────────────────────────────────────┐  │
│  │  generateColorStops(config)        │  │
│  │  • generateStopsIncremental()      │  │
│  │  • generateStopsOrdinal()          │  │
│  │  • generateStopsSemantic()         │  │
│  │  • generateStopsAlphabetical()     │  │
│  └────────────────────────────────────┘  │
│               │                          │
│               │ 4. Retorna stops         │
│               ↓                          │
│  ┌────────────────────────────────────┐  │
│  │  Decisión: ¿Qué hacer?             │  │
│  │  • Preview → enviar a UI           │  │
│  │  • Create styles → llamar Figma API│  │
│  │  • Export JSON → generar JSON      │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
       │
       │ 5a. Preview
       │    postMessage { type: 'preview-generated', stops }
       ↓
┌──────────────────────────────────────────┐
│          UI (ui.html)                    │
│  • Muestra color swatches                │
│  • Display HEX values                    │
└──────────────────────────────────────────┘

       │ 5b. Create Styles
       ↓
┌──────────────────────────────────────────┐
│         Figma API                        │
│  figma.createPaintStyle()                │
│  • style.name = "category/level/..."    │
│  • style.paints = [{ type: 'SOLID' }]   │
└──────────────────────────────────────────┘
       │
       │ 6. Confirmación
       ↓
┌──────────────────────────────────────────┐
│    Estilos creados en Figma ✓           │
└──────────────────────────────────────────┘
```

## 🧩 Componentes Detallados

### 1. UI Layer (ui.html)

**Responsabilidades:**
- Capturar input del usuario
- Renderizar preview visual
- Mostrar feedback
- Descargar archivos JSON

**Tecnologías:**
- HTML5
- CSS3 (Figma design system style)
- Vanilla JavaScript (no frameworks)

**Componentes principales:**
```html
<!-- Inputs -->
<input id="colorName">      <!-- Nombre del color -->
<input id="baseColor">      <!-- HEX del color base -->
<select id="scaleType">     <!-- Tipo de escala -->
<input id="stopsCount">     <!-- Número de stops -->

<!-- Batch Mode -->
<div id="batchContainer">   <!-- Contenedor para múltiples colores -->

<!-- Preview -->
<div id="preview">          <!-- Vista previa de los stops -->

<!-- Actions -->
<button id="generatePreview">   <!-- Genera preview -->
<button id="createStyles">      <!-- Crea estilos en Figma -->
<button id="exportJSON">        <!-- Exporta JSON -->
```

### 2. Plugin Code Layer (code.ts)

**Responsabilidades:**
- Procesar configuración
- Generar color stops
- Interactuar con Figma API
- Exportar datos

**Funciones principales:**

```typescript
// Generación de colores
generateColorStops(config)
  → generateStopsIncremental()
  → generateStopsOrdinal()
  → generateStopsSemantic()
  → generateStopsAlphabetical()

// Interacción con Figma
createFigmaStyles(config, stops)
  → figma.createPaintStyle()
  → figma.getLocalPaintStyles()

// Exportación
exportAsJSON(config, stops)
  → Estructura Design Tokens
```

**Helpers:**
```typescript
hexToRgb(hex: string): RGB
rgbToHex(rgb: RGB): string
mixColors(color1: RGB, color2: RGB, percentage: number): RGB
```

### 3. Core Module (colorGenerator.js)

**Responsabilidades:**
- Lógica pura de generación
- Sin dependencias de UI o API
- Testeable independientemente

**Exports:**
```javascript
export const MIN_MIX = 10
export const MAX_MIX = 90
export const SEMANTIC_ORDER = [...]

export const generateStopsIncremental
export const generateStopsOrdinal
export const generateStopsSemantic
export const generateStopsAlphabetical
export const calculateMiddleKeys
export const hexToRgb
export const generateColorStops
```

## 🔐 Sandboxing & Security

El plugin de Figma se ejecuta en un sandbox con restricciones:

```
┌─────────────────────────────────────┐
│         Plugin Sandbox              │
│  • No file system access            │
│  • No network requests (default)    │
│  • No external scripts              │
│  • Only Figma API access            │
└─────────────────────────────────────┘
         ↕️ postMessage only
┌─────────────────────────────────────┐
│         UI iframe                   │
│  • Standard web APIs                │
│  • Can download files               │
│  • No Figma API access              │
└─────────────────────────────────────┘
```

Por eso:
- No podemos usar `fs` (file system)
- No podemos usar `inquirer` (CLI)
- Debemos implementar mixing manualmente (no `tinycolor2`)
- Comunicación exclusiva vía `postMessage`

## 📦 Build Process

```
Source Files                 Build                   Output
────────────────────────────────────────────────────────────
src/code.ts          →    tsc (TypeScript)    →    dist/code.js
                           Compile

src/ui.html          →    cp (Copy)           →    dist/ui.html
                           Direct copy

manifest.json        →    (Used as-is)        →    manifest.json
```

**Build commands:**
```bash
npm run build      # Compile once
npm run watch      # Compile on file change
npm run copy-ui    # Copy HTML only
```

## 🎯 Design Decisions

### 1. ¿Por qué TypeScript para code.ts?
- ✅ Type safety con Figma API
- ✅ Better IntelliSense
- ✅ Catch errors at compile time
- ✅ Self-documenting code

### 2. ¿Por qué vanilla JS para ui.html?
- ✅ No build step needed
- ✅ Smaller bundle size
- ✅ Faster load time
- ✅ Simple enough without framework

### 3. ¿Por qué no usar tinycolor2 en el plugin?
- ❌ Cannot bundle external dependencies easily
- ❌ Would require webpack/rollup setup
- ✅ Simple RGB mixing is sufficient
- ✅ Keeps bundle tiny

### 4. ¿Por qué extraer colorGenerator.js?
- ✅ Single source of truth
- ✅ Reusable across tools
- ✅ Easier to test
- ✅ Can add more tools later

## 🔄 Extensibilidad

Para agregar nuevos tipos de escalas:

1. **Core module** (`colorGenerator.js`):
```javascript
export const generateStopsCustom = (hex, options, tinycolor) => {
  // Nueva lógica
}
```

2. **Plugin code** (`code.ts`):
```typescript
function generateStopsCustom(hex: string, options: any): Record<string, string> {
  // Implementación nativa (sin tinycolor)
}

// Agregar al switch en generateColorStops()
case 'custom':
  return generateStopsCustom(hex, options);
```

3. **UI** (`ui.html`):
```html
<option value="custom">Custom Scale</option>

<!-- Agregar opciones específicas -->
<div id="customOptions" class="hidden">
  <!-- Configuración para custom scale -->
</div>
```

## 🧪 Testing Strategy

```
Unit Tests                    Integration Tests
──────────────────────────────────────────────────
colorGenerator.js     →       CLI wizard
  • generateStops*()            • File output
  • calculateMiddle()           • Format conversion
  • hexToRgb()
                      →       Figma plugin
                                • Figma API calls
                                • Style creation
```

**Herramientas sugeridas:**
- Jest para unit tests
- Figma Plugin Testing API para integration tests

## 📈 Performance

**Métricas:**
- **UI Load**: ~50ms (inline CSS, no external deps)
- **Generate 10 stops**: ~1ms (simple calculations)
- **Create 10 Figma styles**: ~50ms (Figma API calls)
- **Export JSON**: ~5ms (serialization)

**Optimizaciones:**
- Inline everything (no external loads)
- Cache calculations where possible
- Batch Figma API calls
- Debounce preview updates

## 🎨 UI/UX Considerations

**Design System:**
- Follows Figma's UI patterns
- Uses Figma's color palette
- Responsive to different window sizes

**User Flow:**
1. Configure → Preview → Create/Export
2. Clear feedback at each step
3. Non-destructive (can preview first)
4. Batch operations for efficiency

**Accessibility:**
- Keyboard navigation
- Clear labels
- Visual feedback
- Error messages

---

Esta arquitectura permite:
- ✅ Separación de concerns
- ✅ Code reusability
- ✅ Easy testing
- ✅ Future extensibility
- ✅ Performance optimization
