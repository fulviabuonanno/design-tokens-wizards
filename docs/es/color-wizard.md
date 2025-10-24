## 🎨 **Maguito de Tokens de Color**

<img src="src/assets/color_wiz.png" alt="Color Wizard" width="200">

Versión 2.11.0

¡Conjura una paleta deslumbrante para tu sistema de diseño con el Maguito de Tokens de Color 🧙! Este script mágico te guía a través de cada paso para crear tokens de color flexibles y escalables, sin necesidad de libro de hechizos.

**Última Actualización (v2.11.0):** 🎨 ¡Función de modo por lotes mejorada! Ahora puedes agregar múltiples colores a la vez usando dos métodos convenientes:
- **Entrada Masiva:** Pega múltiples códigos HEX separados por comas o punto y coma (ej., `#FF5733, 3498DB; 2ECC71`)
- **Entrada Individual:** Agrega colores uno a la vez con retroalimentación inmediata
Todos los colores en un lote comparten la misma configuración de escala, acelerando drásticamente la creación de paletas de colores completas.

**Actualización Anterior (v2.9.1):** Se corrigió la lógica de selección del tono medio - cuando se selecciona un tono medio como 'base', el color hexadecimal original ahora se asigna correctamente al tono medio (ej., "500") y 'base' se elimina de la salida, eliminando valores duplicados.

1. **Invoca el Maguito**  
   Lanza el hechizo de color en tu terminal:

   ```sh
   npm run color
   ```

2. **Elige el Tipo de Token**  
   Selecciona la base de tus tokens de color:

   - **Colores Globales**
   - **Colores Semánticos** (próximamente; actualmente redirige a Global)

3. **Establece la Categoría**  
   (Opcional) Organiza tus tokens por categoría (ej., primitivos, fundamentos, núcleo, básicos, esenciales, global, raíces, o personalizado). Ingresa el tuyo si lo deseas.

4. **Establece el Nivel de Nomenclatura**
   (Opcional) Añade un nivel de nomenclatura para mayor claridad (ej., color, colour, paleta, esquema, o personalizado).

5. **Elige el Modo de Color** ✨
   Selecciona cómo quieres agregar colores:
   - **Color Individual:** Agrega un color a la vez (flujo tradicional)
   - **Modo por Lotes:** Agrega múltiples colores a la vez con la misma configuración de escala

6. **Agrega tus Colores**
   Dependiendo de tu elección de modo:

   **Modo Color Individual:**
   - Ingresa un código de color HEX (ej., `#FABADA`)
   - Vista previa de tu tono mágico
   - Dale a tu color un nombre único (ej., `azul`, `amarillo`, `rojo`)

   **Modo por Lotes** (¡NUEVO en v2.11.0!):

   Elige tu método de entrada:
   - **Entrada Masiva:** Pega múltiples códigos HEX a la vez
     - Separa los códigos con comas (`,`) o punto y coma (`;`)
     - Con o sin el símbolo `#` (ej., `#FF5733, 3498DB; 2ECC71` o `FF5733,3498DB,2ECC71`)
     - Nombra cada color después de ingresar todos los códigos
   - **Entrada Individual:** Agrega colores uno a la vez
     - Ingresa el código HEX y el nombre para cada color
     - Elige agregar más colores cuando estés listo

   ¡Todos los colores en modo por lotes compartirán la misma configuración de escala, acelerando drásticamente la creación de paletas!

7. **Selecciona el Tipo de Escala**
   Decide cómo se generarán tus paradas de color:

   - **Incremental:** 100, 200, 300, 400
   - **Ordinal:** 01, 02, 03, 04 o 1, 2, 3, 4
   - **Alfabético:** A, B, C, D o a, b, c, d
   - **Stops Semánticos:** dark, base, light, etc.

8. **Establece el Número de Paradas**
   Elige cuántos stops (tonos) generar (1-20, dependiendo del tipo de escala).

9. **Personaliza el Rango de Mezcla de Color**
   (Opcional) Establece los porcentajes mínimos y máximos de mezcla (predeterminado: 10%-90%) para controlar cómo tu color base se mezcla con blanco y negro para los stops más claros y oscuros.

10. **Vista Previa y Confirma**
    Revisa tu(s) escala(s) de color en una tabla, completa con nombres de tokens y valores HEX.
    - Para colores individuales: Vista previa completa con todas las paradas mostradas
    - Para modo por lotes: Vista previa del primer color con un resumen de los colores adicionales
    Puedes establecer el tono medio como `base` si lo deseas. Confirma para continuar o reinicia para ajustar.

11. **Expande tu Paleta**
    Añade más colores y repite el proceso tantas veces como quieras.

12. **Exporta y Convierte**  
    Cuando termines, el maguito:

    - Exporta los tokens en formato Tokens Studio JSON (HEX por defecto)
    - Ofrece convertir los tokens a RGB, RGBA y/o HSL
    - Genera archivos CSS y SCSS para cada formato
    - Limpia archivos no utilizados

    Tus artefactos mágicos aparecerán en:

    - JSON: `output_files/tokens/json/color/color_tokens_{format}.json`
    - CSS: `output_files/tokens/css/color/color_variables_{format}.css`
    - SCSS: `output_files/tokens/scss/color/color_variables_{format}.scss`

13. **Revisa tu Hechizo**  
    El mago lista todos los archivos actualizados, nuevos y eliminados.

---

**Nota:**

- El soporte para colores semánticos está planeado pero aún no disponible.
- Todos los pasos permiten entrada personalizada y confirmación antes de continuar.
- El maguito asegura que no haya nombres de color duplicados en tu estructura elegida.
- Siempre puedes reiniciar un paso para ajustar tu entrada.

---