# 🧪 Guía de Prueba del Plugin de Figma

## ✅ Paso 1: Instalación y Build (COMPLETADO)

Ya hemos instalado las dependencias y compilado el plugin:
```
✓ npm install - Dependencias instaladas
✓ npm run build - Plugin compilado
✓ dist/code.js - Generado (11KB)
✓ dist/ui.html - Generado (17KB)
```

## 📍 Paso 2: Abrir Figma Desktop

⚠️ **IMPORTANTE**: El plugin solo funciona en **Figma Desktop**, NO en el navegador web.

1. **Si tienes Figma Desktop instalado:**
   - Ábrelo directamente

2. **Si NO tienes Figma Desktop:**
   - Descárgalo desde: https://www.figma.com/downloads/
   - Instálalo en tu sistema
   - Inicia sesión con tu cuenta de Figma

## 🔌 Paso 3: Importar el Plugin

1. **Abre Figma Desktop**

2. **Ve al menú de Plugins:**
   - Menú superior → `Plugins` → `Development` → `Import plugin from manifest...`

   O usa el atajo:
   - Mac: `⌥ + ⌘ + P` luego escribe "Import plugin"
   - Windows: `Alt + Ctrl + P` luego escribe "Import plugin"

3. **Selecciona el archivo manifest.json:**
   - Navega a: `/home/user/design-tokens-wizards/figma-plugin/manifest.json`
   - Haz clic en "Open" o "Abrir"

4. **Verifica que aparezca:**
   - El plugin "Design Tokens Wizard" debe aparecer en tu lista de plugins de desarrollo

## 🎨 Paso 4: Crear un Documento de Prueba

1. **Crea un nuevo archivo en Figma:**
   - File → New Design File
   - O usa `Ctrl/Cmd + N`

2. **Nombre sugerido:** "Test - Design Tokens Wizard"

## 🚀 Paso 5: Ejecutar el Plugin

1. **Abre el plugin:**
   - Menú: `Plugins` → `Development` → `Design Tokens Wizard`
   - O usa: `Ctrl/Cmd + /` y escribe "Design Tokens Wizard"

2. **Verás la interfaz del plugin:**
   ```
   ┌─────────────────────────────────────┐
   │ 🎨 Design Tokens Wizard             │
   │ Generate beautiful color scales...  │
   ├─────────────────────────────────────┤
   │                                     │
   │ COLOR SETUP                         │
   │ Color Name: [          ]            │
   │ Base Color: [🎨][#3B82F6]          │
   │                                     │
   │ SCALE CONFIGURATION                 │
   │ Scale Type: [Incremental ▼]        │
   │ ...                                 │
   └─────────────────────────────────────┘
   ```

## 🧪 Paso 6: Prueba Básica - Un Color Simple

Vamos a crear tu primera escala de color:

### Configuración:
1. **Color Name:** `blue`
2. **Base Color:** `#3B82F6` (o usa el color picker)
3. **Scale Type:** `Incremental`
4. **Step Size:** `100`
5. **Number of Stops:** `10`
6. **Start Value:** `100`
7. **Category:** `test` (opcional)
8. **Naming Level:** `color` (opcional)

### Generar:
1. Haz clic en **"Generate Preview"**
   - Deberías ver 10 colores desde claro hasta oscuro

2. Haz clic en **"Create Figma Styles"**
   - Debería aparecer el mensaje: "✅ Created 11 color styles!"

### Verificar:
1. En Figma, abre el panel de **Local Styles** (icono de 4 círculos en el toolbar)
2. Deberías ver:
   ```
   test/color/blue/base
   test/color/blue/100
   test/color/blue/200
   test/color/blue/300
   ...
   test/color/blue/1000
   ```

## 🎯 Paso 7: Prueba Avanzada - Modo Batch

Ahora prueba crear múltiples colores a la vez:

### Configuración:
1. **✓ Batch Mode** - Marca el checkbox
2. Haz clic en **"+ Add Another Color"** 3 veces
3. Configura los colores:
   ```
   Color 1: #3B82F6 → blue
   Color 2: #10B981 → green
   Color 3: #EF4444 → red
   ```
4. **Scale Type:** `Semantic`
5. **Number of Stops:** `6`
6. **Category:** `primitives`
7. **Naming Level:** `palette`

### Generar:
1. **"Generate Preview"** - verás el preview del primer color
2. **"Create Figma Styles"** - ¡creará estilos para los 3 colores!

### Resultado esperado:
Deberías ver ~21 estilos creados (7 stops × 3 colores):
```
primitives/palette/blue/darkest
primitives/palette/blue/darker
primitives/palette/blue/dark
primitives/palette/blue/base
primitives/palette/blue/light
primitives/palette/blue/lighter
primitives/palette/blue/lightest

primitives/palette/green/...
primitives/palette/red/...
```

## 📦 Paso 8: Probar Exportación JSON

1. Genera una escala de color
2. Haz clic en **"Export JSON"**
3. Debería descargarse un archivo `color-tokens.json`
4. Ábrelo y verifica la estructura:
   ```json
   {
     "test": {
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

## 🎨 Paso 9: Usar los Estilos Creados

1. **Crea un rectángulo** en Figma (R)
2. **Selecciónalo**
3. En el panel de propiedades, haz clic en el **color de relleno**
4. En lugar de elegir un color, ve a **"Local Styles"**
5. Verás todos los estilos que creaste
6. Selecciona uno y ¡listo! Tu rectángulo usa el token de color

## 🔄 Paso 10: Desarrollo con Watch Mode

Para desarrollo continuo:

1. Abre una nueva terminal:
   ```bash
   cd /home/user/design-tokens-wizards/figma-plugin
   npm run watch
   ```

2. Esto monitoreará cambios en `src/code.ts`

3. Cada vez que guardes cambios:
   - TypeScript recompilará automáticamente
   - Necesitarás recargar el plugin en Figma
   - Figma: Plugins → Development → Reload plugin

## 🐛 Troubleshooting

### "El plugin no aparece en el menú"
- ✓ ¿Usaste Figma Desktop? (no funciona en web)
- ✓ ¿Importaste el manifest.json correcto?
- ✓ Reinicia Figma Desktop

### "No se crean los estilos"
- ✓ ¿Hiciste clic en "Generate Preview" primero?
- ✓ ¿El color HEX es válido? (debe empezar con #)
- ✓ Abre la consola de Figma: Plugins → Development → Open Console

### "Error en la consola"
- Copia el error y revisa `dist/code.js`
- Verifica que el build haya sido exitoso
- Prueba con `npm run build` de nuevo

### "La UI se ve rara"
- Verifica que `dist/ui.html` existe
- Refresca el plugin: Close plugin → Open again

## 📸 Captura de Pantalla (simulada)

```
Figma Desktop
┌────────────────────────────────────────────────────────┐
│ File  Edit  View  Plugins  Help                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Canvas aquí...                                        │
│                                                        │
│  ┌──────────────────────────┐                         │
│  │ Local Styles             │                         │
│  ├──────────────────────────┤                         │
│  │ test/color/blue/base     │ ●                       │
│  │ test/color/blue/100      │ ○                       │
│  │ test/color/blue/200      │ ○                       │
│  │ test/color/blue/300      │ ○                       │
│  │ ...                      │                         │
│  └──────────────────────────┘                         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## ✅ Checklist de Prueba Completa

- [ ] Plugin instalado en Figma Desktop
- [ ] Crear escala incremental simple
- [ ] Verificar estilos en Local Styles
- [ ] Crear escala semántica
- [ ] Probar modo batch (múltiples colores)
- [ ] Exportar JSON
- [ ] Aplicar estilo a un objeto en Figma
- [ ] Probar con diferentes categorías/niveles
- [ ] Probar escala ordinal (padded/unpadded)
- [ ] Probar escala alfabética (uppercase/lowercase)

## 🎉 ¡Listo!

Si todos los pasos funcionan, tu plugin está correctamente integrado. Ahora puedes:

- Experimentar con diferentes configuraciones
- Crear tu sistema de colores completo
- Exportar tokens para tu proyecto
- Modificar el código y ver cambios en tiempo real

## 📞 Soporte

Si encuentras algún problema:
1. Revisa la consola del plugin en Figma
2. Verifica los logs en la terminal (si usas watch mode)
3. Compara con los ejemplos en el README.md

---

**¡Disfruta creando tus design tokens!** 🎨✨
