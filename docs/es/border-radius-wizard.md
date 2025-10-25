## 🔲 **Maguito de Tokens de Radio de Borde**

<img src="src/assets/radii_wiz.png" alt="Border Radius Wizard" width="200">

![Border Radius Wizard](https://img.shields.io/badge/Border%20Radius%20Wiz-v1.7.2-green)

¡Conjura el sistema de radio de borde perfecto para tu diseño con el Maguito de Tokens de Radio de Borde 🧙! Este maguito te ayuda a crear un conjunto armonioso de tokens de radio de borde que traerán elegancia y consistencia a tus elementos de UI.

1. **Invoca el Maguito**  
   Lanza el hechizo de radio de borde en tu terminal:

   ```sh
   npm run radius
   ```

2. **Define la Unidad Base**  
   La unidad base predeterminada para los tokens de radio de borde es píxeles (px).

3. **Nombra tus Tokens de Radio de Borde**  
   Proporciona un nombre para tus tokens de radio de borde (ej., radius, rad).

4. **Selecciona el Tipo de Escala**  
   Elige una escala predefinida para tus tokens:

   - Sistema de Cuadrícula de 4 Puntos
   - Sistema de Cuadrícula de 8 Puntos
   - Escala Modular (basada en multiplicador)
   - Intervalos Personalizados
   - Escala Fibonacci

5. **Establece el Número de Valores**  
   Especifica cuántos valores de radio de borde quieres generar (ej., 6 valores para una escala de pequeño a grande).

6. **Elige la Convención de Nomenclatura**  
   Selecciona un patrón de nomenclatura para tus tokens de radio de borde:

   - Tallas (xs, sm, md, lg, xl)
   - Incremental (100, 200, 300)
   - Ordinal (1, 2, 3)
   - Alfabética (A, B, C o a, b, c)

7. **Vista Previa de tus Tokens**  
   El maguito mostrará la vista previa de tus tokens de radio de borde:

   ```
   Nombre: Radius
   ┌─────────┬─────────┐
   │ Escala  │ Valor   │
   ├─────────┼─────────┤
   │ 01      │ 4px     │
   │ 02      │ 8px     │
   │ 03      │ 12px    │
   │ 04      │ 16px    │
   └─────────┴─────────┘
   ```

8. **Genera tus Artefactos**  
   Una vez confirmado, el maguito:

   - Exporta tus tokens en formato Tokens Studio JSON
     Almacenado en: `output_files/tokens/radius/radius_tokens_{unit}.json`
   - Crea archivos CSS y SCSS con tus tokens como variables
     Almacenado en `output_files/tokens/css/radius/radius_variables_{unit}.css` y `output_files/tokens/scss/radius/radius_variables_{unit}.scss`

9. **Finaliza tu Hechizo**  
   Revisa los archivos de salida e integra tus tokens de radio de borde en tu sistema.

---
