## 🔤 **Maguito de Tokens de Tipografía**

<img src="src/assets/typo_wiz.png" alt="Typography Wizard" width="200">

![Typography Wizard](https://img.shields.io/badge/Typography%20Wiz-v1.2.3-red)

¡Crea una poción tipográfica armoniosa para tu sistema de diseño con el Maguito de Tokens de Tipografía 🧙! Este maguito te ayuda a combinar familias de fuentes, tamaños, pesos, espaciados y alturas en un sistema tipográfico cohesivo.

## Capacidades Clave

- **Configuración Multi-Propiedad:** Configura familias de fuentes, tamaños, pesos, espaciado entre letras y alturas de línea en una sesión
- **Convenciones de Nomenclatura Flexibles:** Elige entre nomenclatura semántica, tallas, incremental, ordinal, alfabética o basada en propósito
- **Múltiples Tipos de Escala:** Soporte para escalas de 4 puntos, 8 puntos, modular, Fibonacci y personalizada
- **Múltiples Unidades:** Exporta en unidades px, rem, em o porcentaje
- **Guías de Accesibilidad:** Recomendaciones integradas para valores tipográficos óptimos
- **Archivos Autogenerados:** Tokens JSON, variables CSS y variables SCSS listos para usar

---

## Cómo Usar

### 1. **Invoca el Maguito**  
   Lanza el hechizo de tipografía en tu terminal:

   ```sh
   npm run typo
   ```

2. **Elige tus Propiedades**  
   Selecciona qué propiedades tipográficas deseas configurar:

   - Familias de Fuentes (Font Family)
   - Tamaños de Fuente (Font Size)
   - Pesos de Fuente (Font Weight)
   - Espaciado entre Letras (Letter Spacing)
   - Alturas de Línea (Line Height)

3. **Configura la Familia de Fuente**

   - Nombra tu propiedad (fontFamily, font-family, fonts, ff, o personalizado)
   - Define 1-3 familias de fuentes con alternativas
   - Elige convención de nomenclatura:
     - Semántica (primaria, secundaria, terciaria)
     - Basada en propósito (título, cuerpo, detalles)
     - Ordinal (1, 2, 3)
     - Alfabética (a, b, c)

4. **Configura el Tamaño de Fuente**

   - Nombra tu propiedad (fontSize, font-size, size, fs, o personalizado)
   - Selecciona tipo de escala:
     - Cuadrícula de 4 Puntos
     - Cuadrícula de 8 Puntos
     - Escala Modular
     - Intervalos Personalizados
     - Escala Fibonacci
   - Elige unidad (px, rem, em)
   - Define 1-12 tamaños con convención de nomenclatura:
     - Tallas (xs, sm, md, lg, xl)
     - Incremental (10, 20, 30)
     - Ordinal (1, 2, 3)
     - Alfabética (a, b, c...)

5. **Configura el Peso de Fuente**

   - Nombra tu propiedad (fontWeight, font-weight, weight, fw, o personalizado)
   - Selecciona de pesos estándar (100-900)
   - Elige convención de nomenclatura:
     - Tallas (xs a xl)
     - Semántica (fino a negrita)
     - Ordinal (1 a 5)
     - Basada en propósito (cuerpo, encabezado...)

6. **Configura el Espaciado entre Letras**

   - Nombra tu propiedad (letterSpacing, letter-spacing, tracking, ls, o personalizado)
   - Elige tipo de escala:
     - Escala Predeterminada (-1.25 a 6.25)
     - Valores Personalizados
   - Selecciona unidad (em, rem, %)
   - Define 1-7 valores con convención de nomenclatura:
     - Tallas (xs a xl)
     - Incremental (100, 200...)
     - Ordinal (01, 02... o 1, 2...)
     - Alfabética (a, b, c...)

7. **Configura la Altura de Línea**

   - Nombra tu propiedad (lineHeight, line-height, leading, lh, o personalizado)
   - Elige tipo de escala:
     - Escala Predeterminada 1 (1.1, 1.25, 1.5, 1.6, 1.75, 2.0)
     - Escala Predeterminada 2 (1.0, 1.2, 1.5, 1.6, 2.0)
     - Valores Personalizados
   - Elige convención de nomenclatura:
     - Tallas (xs a xl)
     - Semántica (apretado, normal, suelto, relajado, espacioso)
     - Ordinal (1 a 5)
     - Basada en propósito (cuerpo, encabezado, display, compacto, expandido)
     - Incremental (100, 200...)
     - Alfabética (a, b, c...)

8. **Vista Previa de tus Tokens**  
   Para cada propiedad, verás una tabla de vista previa mostrando tus valores configurados.

9. **Genera tus Artefactos**  
   Una vez confirmado, el maguito:

   - Exporta tus tokens en formato Tokens Studio JSON
     Almacenado en: `output_files/tokens/typography/typography_tokens.json`
   - Crea archivos CSS y SCSS con tus tokens como variables
     Almacenado en `output_files/tokens/css/typography/typography_variables.css` y `output_files/tokens/scss/typography/typography_variables.scss`

10. **Finaliza tu Hechizo**  
    Revisa los archivos de salida e integra tus tokens de tipografía en tu sistema.

---

**Nota:**

- Cada paso incluye guías y recomendaciones de accesibilidad.
- El maguito sugiere valores óptimos mientras permite personalización.
- Siempre puedes reiniciar un paso para ajustar tu entrada.

---
