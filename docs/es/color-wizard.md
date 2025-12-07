## 🎨 **Maguito de Tokens de Color**

<img src="src/assets/color_wiz.png" alt="Color Wizard" width="200">

![Color Wizard](https://img.shields.io/badge/Color%20Wiz-v2.11.1-yellow)

¡Conjura una paleta deslumbrante para tu sistema de diseño con el Maguito de Tokens de Color 🧙! Este script mágico te guía a través de cada paso para crear tokens de color flexibles y escalables, sin necesidad de libro de hechizos.

**Última Actualización (v2.11.1):** ✨ ¡UX mejorada del maguito con organización de pasos más clara! El flujo del maguito ahora presenta una jerarquía visual mejorada con numeración de pasos consistente (PASO 1-4) y navegación más limpia durante todo el proceso de creación de color.

**Actualización Anterior (v2.11.0):** 🎨 ¡Configuraciones preestablecidas estándar de la industria! Comienza rápidamente con formatos de escala de color probados de sistemas de diseño líderes (Tailwind CSS, Material Design 3, Chakra UI, Ant Design, y más). Elige entre más de 15 preestablecidos cuidadosamente curados o continúa con configuración personalizada completa. Además, modo por lotes mejorado con métodos de entrada masiva e individual para agregar múltiples colores eficientemente.

1. **Invoca el Maguito**  
   Lanza el hechizo de color en tu terminal:

   ```sh
   npm run color
   ```

2. **PASO 1: TIPO DE TOKEN**
   Configura la estructura de tus tokens:

   **Elige el Tipo de Token:**
   - **Colores Globales**
   - **Colores Semánticos** (próximamente; actualmente redirige a Global)

   **Selección de Categoría:** (Opcional)
   Organiza tus tokens por categoría (ej., primitivos, fundamentos, núcleo, básicos, esenciales, global, raíces, o personalizado). Ingresa el tuyo si lo deseas.

   **Nivel de Nomenclatura:** (Opcional)
   Añade un nivel de nomenclatura para mayor claridad (ej., color, colour, paleta, esquema, o personalizado).

3. **PASO 2: SELECCIONAR COLOR** ✨
   Elige tu método de entrada de color:

   **Modo Color Individual:**
   - Ingresa un código de color HEX (ej., `#FABADA`)
   - Vista previa de tu tono mágico
   - Dale a tu color un nombre único (ej., `azul`, `amarillo`, `rojo`)

   **Modo por Lotes:**
   Agrega múltiples colores a la vez con la misma configuración de escala.

   Elige tu método de entrada:
   - **Entrada Masiva:** Pega múltiples códigos HEX a la vez
     - Separa los códigos con comas (`,`) o punto y coma (`;`)
     - Con o sin el símbolo `#` (ej., `#FF5733, 3498DB; 2ECC71`)
     - Nombra cada color después de ingresar todos los códigos
   - **Entrada Individual:** Agrega colores uno a la vez
     - Ingresa el código HEX y el nombre para cada color
     - Elige agregar más colores cuando estés listo

4. **PASO 3: CONFIGURAR ESCALA DE COLOR** 🎯
   Elige cómo configurar tu escala de color:

   **🎯 Usar un Preestablecido** (¡NUEVO en v2.11.0!)
   Comienza rápidamente con configuraciones estándar de la industria:

   **Categorías de Preestablecidos Disponibles:**

   - **🔥 Frameworks Populares** - Sistemas de diseño estándar de la industria
     - Tailwind CSS (50-950, 10 stops)
     - Material Design (100-900, 9 stops)
     - Bootstrap (100-900, 9 stops)
     - Chakra UI (50-950, 10 stops)

   - **🧩 Bibliotecas de Componentes** - Escalas de bibliotecas de componentes UI
     - Ant Design (1-10, ordinal)
     - Mantine UI (0-9, ordinal)
     - Radix Colors (01-12, ordinal con relleno)

   - **🏢 Sistemas Empresariales** - Sistemas de diseño empresariales
     - IBM Carbon (10-100, 10 stops)
     - Adobe Spectrum (100-1400, 14 stops)

   - **🎨 Escalas Minimalistas** - Escalas de color simples y enfocadas
     - Cinco Tonos (100-500, 5 stops)
     - Siete Tonos (100-700, 7 stops)
     - Semántico Simple (oscuro, base, claro)
     - Semántico Extendido (10 variaciones semánticas)

   - **📝 Otros Formatos** - Esquemas de nomenclatura alternativos
     - Alfabético A-J (10 stops)

   ¡Cada preestablecido incluye rangos de mezcla optimizados y conteos de stops adaptados a ese sistema de diseño. Previsualiza tu preestablecido seleccionado con detalles de configuración antes de confirmar!

   **⚙️ Configuración Personalizada**
   Control total con ajustes personalizados:

   **Selecciona el Tipo de Escala:**
   - **Incremental:** 100, 200, 300, 400
   - **Ordinal:** 01, 02, 03, 04 o 1, 2, 3, 4
   - **Alfabético:** A, B, C, D o a, b, c, d
   - **Stops Semánticos:** dark, base, light, etc.

   **Establece el Número de Paradas:**
   Elige cuántos stops (tonos) generar (1-20, dependiendo del tipo de escala).

   **Personaliza el Rango de Mezcla de Color:** (Opcional)
   Establece los porcentajes mínimos y máximos de mezcla (predeterminado: 10%-90%) para controlar cómo tu color base se mezcla con blanco y negro para los stops más claros y oscuros.

5. **PASO 4: PREVISUALIZAR Y CONFIRMAR**
    Revisa tu(s) escala(s) de color en una tabla, completa con nombres de tokens y valores HEX.

    - Para colores individuales: Vista previa completa con todas las paradas mostradas
    - Para modo por lotes: Vista previa del primer color con un resumen de los colores adicionales

    Puedes establecer el tono medio como `base` si lo deseas. Confirma para continuar o reinicia para ajustar.

6. **Expande tu Paleta**
    Añade más colores y repite el proceso tantas veces como quieras.

7. **Exporta y Convierte**
    Cuando termines, el maguito:

    - Exporta los tokens en formato Tokens Studio JSON (HEX por defecto)
    - Ofrece convertir los tokens a RGB, RGBA, HSL y/o OKLCH
    - Genera archivos CSS y SCSS para cada formato
    - Limpia archivos no utilizados

    Tus artefactos mágicos aparecerán en:

    - JSON: `output_files/tokens/json/color/color_tokens_{format}.json`
    - CSS: `output_files/tokens/css/color/color_variables_{format}.css`
    - SCSS: `output_files/tokens/scss/color/color_variables_{format}.scss`

8. **Revisa tu Hechizo**
    El mago lista todos los archivos actualizados, nuevos y eliminados.

---

**Nota:**

- El soporte para colores semánticos está planeado pero aún no disponible.
- Todos los pasos permiten entrada personalizada y confirmación antes de continuar.
- El maguito asegura que no haya nombres de color duplicados en tu estructura elegida.
- Siempre puedes reiniciar un paso para ajustar tu entrada.

---
