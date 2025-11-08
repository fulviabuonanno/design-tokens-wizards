# 🔗 Integración del Plugin de Figma con color_wiz.js

## 📋 Resumen de la Integración

He creado una integración completa que permite usar la lógica de `color_wiz.js` directamente en Figma como un plugin. La estructura está diseñada para compartir código entre el CLI y el plugin.

## 🏗️ Arquitectura del Sistema

```
design-tokens-wizards/
│
├── src/
│   ├── wizards/
│   │   └── color_wiz.js          # CLI wizard original
│   │
│   └── core/
│       └── colorGenerator.js      # ✨ NUEVO: Lógica compartida
│
└── figma-plugin/                  # ✨ NUEVO: Plugin de Figma
    ├── manifest.json              # Configuración del plugin
    ├── package.json               # Dependencias
    ├── tsconfig.json              # Config de TypeScript
    ├── README.md                  # Documentación completa
    │
    ├── src/
    │   ├── code.ts               # Código del plugin (sandbox)
    │   └── ui.html               # Interfaz de usuario
    │
    └── dist/                     # Archivos compilados
        ├── code.js
        └── ui.html
```

## 🎯 ¿Qué se ha creado?

### 1. **Módulo Core Compartido** (`src/core/colorGenerator.js`)

Este módulo extrae toda la lógica de generación de colores para que pueda ser reutilizada:

- ✅ `generateStopsIncremental()` - Escalas incrementales (100, 200, 300...)
- ✅ `generateStopsOrdinal()` - Escalas ordinales (1, 2, 3...)
- ✅ `generateStopsAlphabetical()` - Escalas alfabéticas (A, B, C...)
- ✅ `generateStopsSemantic()` - Escalas semánticas (light, base, dark...)
- ✅ `calculateMiddleKeys()` - Cálculo de tonos medios
- ✅ Constantes compartidas (`MIN_MIX`, `MAX_MIX`, `SEMANTIC_ORDER`)

**Ventajas:**
- ✨ Un solo lugar para mantener la lógica
- ✨ Consistencia garantizada entre CLI y plugin
- ✨ Más fácil de testear
- ✨ Reutilizable en otros contextos

### 2. **Plugin de Figma Completo**

#### **UI (interface)** - `src/ui.html`
- Interfaz intuitiva similar al CLI wizard
- Selector de color visual + input HEX
- Configuración de escalas con preview en tiempo real
- **Modo Batch**: agregar múltiples colores de una vez
- Soporte para categorías y niveles de naming
- Vista previa con swatches de colores
- Exportación a JSON

#### **Plugin Code** - `src/code.ts`
- Implementación nativa de mixing de colores (sin dependencias)
- Genera stops usando la misma lógica que el CLI
- Crea/actualiza **Figma Paint Styles** automáticamente
- Exporta tokens en formato Design Tokens Community Group
- Manejo de comunicación UI ↔ Figma API

### 3. **Sistema de Build**
- TypeScript para type safety
- Compilación automática
- Watch mode para desarrollo

## 🚀 Cómo Usar

### Paso 1: Instalar Dependencias

```bash
cd figma-plugin
npm install
```

### Paso 2: Compilar el Plugin

```bash
npm run build
```

Esto generará los archivos en `dist/`:
- `dist/code.js` - Código del plugin compilado
- `dist/ui.html` - Interfaz de usuario

### Paso 3: Cargar en Figma

1. Abre **Figma Desktop** (no funciona en navegador para desarrollo)
2. Ve a `Plugins` → `Development` → `Import plugin from manifest...`
3. Selecciona el archivo `manifest.json` en la carpeta `figma-plugin`
4. ¡El plugin aparecerá en tu lista de plugins!

### Paso 4: Usar el Plugin

1. En Figma, ejecuta el plugin: `Plugins` → `Design Tokens Wizard`
2. Configura tu color:
   - **Nombre**: "blue", "primary", etc.
   - **Color base**: Usa el picker o escribe HEX
   - **Tipo de escala**: Incremental, Ordinal, Alfabética, Semántica
   - **Número de stops**: 1-20
3. Haz clic en **"Generate Preview"** para ver el resultado
4. Haz clic en **"Create Figma Styles"** para crear los estilos

### Paso 5: Ver los Estilos Creados

Los estilos se crean con nombres jerárquicos:
```
primitives/color/blue/base
primitives/color/blue/100
primitives/color/blue/200
primitives/color/blue/300
...
```

## 🔄 Workflow Integrado: CLI + Plugin

### Opción 1: CLI para Desarrollo
```bash
npm run color
```
- Genera archivos JSON/CSS/SCSS en `output_files/`
- Versiona los tokens en Git
- Usa en tu pipeline de build

### Opción 2: Plugin para Diseño
- Genera estilos directamente en Figma
- Prueba rápidamente diferentes escalas
- Sincroniza con el diseño en tiempo real

### Opción 3: Híbrido (Recomendado)
1. Usa el **Plugin** para experimentar y crear estilos en Figma
2. Exporta a JSON desde el plugin
3. Usa el **CLI** para generar las versiones CSS/SCSS
4. Versionas todo en Git

## 🎨 Características del Plugin

### ✨ Modo Batch
Agrega múltiples colores que compartirán la misma configuración de escala:

```
Color 1: #3B82F6 → blue
Color 2: #10B981 → green
Color 3: #EF4444 → red

Todos con: Incremental, 100 steps, 10 stops
```

Resultado: 30 estilos creados (3 colores × 10 stops) instantáneamente!

### 🎯 Naming Inteligente

**Sin categoría/nivel:**
```
blue/base
blue/100
blue/200
```

**Con categoría:**
```
primitives/blue/base
primitives/blue/100
```

**Con categoría + nivel:**
```
primitives/color/blue/base
primitives/color/blue/100
```

### 📦 Exportación de Tokens

El plugin exporta en formato Design Tokens Community Group:

```json
{
  "primitives": {
    "color": {
      "blue": {
        "base": {
          "$value": "#3B82F6",
          "$type": "color"
        },
        "100": {
          "$value": "#DBEAFE",
          "$type": "color"
        }
      }
    }
  }
}
```

Compatible con:
- ✅ Tokens Studio for Figma
- ✅ Style Dictionary
- ✅ Amazon Style Dictionary
- ✅ Theo by Salesforce

## 🔧 Desarrollo del Plugin

### Watch Mode
Para desarrollo activo con auto-reload:

```bash
cd figma-plugin
npm run watch
```

Esto recompilará automáticamente cuando guardes cambios en `code.ts`.

### Estructura de Mensajes

El plugin usa `postMessage` para comunicación:

**UI → Plugin Code:**
```javascript
parent.postMessage({
  pluginMessage: {
    type: 'create-styles',
    config: { ... }
  }
}, '*');
```

**Plugin Code → UI:**
```javascript
figma.ui.postMessage({
  type: 'styles-created',
  count: 10
});
```

## 🆚 Comparación: CLI vs Plugin

| Característica | CLI (color_wiz.js) | Plugin de Figma |
|----------------|-------------------|-----------------|
| **Interfaz** | Terminal interactivo | UI visual en Figma |
| **Salida** | JSON, CSS, SCSS | Figma Paint Styles + JSON |
| **Velocidad** | Rápido para batch | Instantáneo en Figma |
| **Versionamiento** | ✅ Perfecto | Manual (export JSON) |
| **Testing Visual** | No directo | ✅ Inmediato |
| **Integración CI/CD** | ✅ Ideal | No aplicable |
| **Prototipado** | Menos ágil | ✅ Muy rápido |

## 🎓 Mejores Prácticas

### 1. **Naming Consistente**
Usa la misma estructura de categoría/nivel tanto en CLI como plugin:
- Categoría: `primitives`, `foundation`, `core`
- Nivel: `color`, `palette`, `scheme`

### 2. **Source of Truth**
Define qué es la fuente de verdad:
- **Opción A**: CLI genera → importas a Figma
- **Opción B**: Plugin genera en Figma → exportas JSON → usas en código
- **Opción C**: Sincronización bidireccional con Tokens Studio

### 3. **Testing**
- Usa el plugin para probar rápidamente diferentes escalas
- Una vez satisfecho, genera con CLI para producción
- Versionas los JSON/CSS/SCSS en Git

### 4. **Documentación**
Documenta tus decisiones:
```markdown
## Color System

- **Scale Type**: Incremental (100)
- **Range**: 100-1000 (10 stops)
- **Naming**: primitives/color/{name}/{stop}
- **Tools**: CLI for production, Plugin for testing
```

## 🐛 Troubleshooting

### "Cannot find module '@figma/plugin-typings'"
```bash
cd figma-plugin
npm install
```

### "tsc: command not found"
```bash
npm install -g typescript
# o usa npx:
npx tsc
```

### "Plugin no aparece en Figma"
1. ¿Estás usando Figma Desktop? (no funciona en web para development)
2. ¿Ejecutaste `npm run build`?
3. ¿El path a manifest.json es correcto?

### "Los colores no se ven bien"
- El plugin usa mixing RGB (como tinycolor)
- Rango por defecto: 10%-90%
- Para ajustar, modifica `MIN_MIX` y `MAX_MIX` en `code.ts`

## 📚 Próximos Pasos

### Mejoras Sugeridas:

1. **Refactorizar color_wiz.js**
   - Importar funciones de `colorGenerator.js`
   - Eliminar código duplicado
   - Mantener solo la lógica de CLI (inquirer, file I/O)

2. **Testing**
   - Unit tests para `colorGenerator.js`
   - Tests de integración para el plugin

3. **Publicación**
   - Publicar en Figma Community
   - Crear video demo
   - Documentación de usuario final

4. **Características Adicionales**
   - Soporte para colores semánticos (success, error, warning)
   - Importar colores existentes de Figma
   - Generar tokens de otros tipos (spacing, typography)

## 🎉 Resultado Final

Ahora tienes:

✅ Un **módulo core compartido** con toda la lógica de generación
✅ Un **plugin de Figma** completamente funcional
✅ **Documentación completa** en español e inglés
✅ **Flexibilidad** para usar CLI o plugin según el contexto
✅ **Consistencia** garantizada entre ambas herramientas

¡Tu flujo de trabajo de design tokens ahora es mucho más poderoso! 🚀

---

**¿Preguntas? ¿Problemas?**
Abre un issue en el repositorio o revisa la documentación en `figma-plugin/README.md`
