## 🔳 **Maguito de Tokens de Espaciado**

<img src="src/assets/space_wiz.png" alt="Space Wizard" width="200">

Versión 1.7.2

¡Conjura el sistema de espaciado perfecto para tu diseño con el Maguito de Tokens de Espaciado 🧙! Este maguito te ayuda a crear un conjunto armonioso de tokens de espaciado que traerán equilibrio y ritmo a tus diseños.

1. **Invoca el Maguito**  
   Lanza el hechizo de espaciado en tu terminal:

   ```sh
   npm run space
   ```

2. **Define la Unidad Base**  
   La unidad base predeterminada para los tokens de espaciado es píxeles (px).

3. **Nombra tus Tokens de Espaciado**  
   Proporciona un nombre para tus tokens de espaciado (ej., space, spc).

4. **Selecciona el Tipo de Escala**  
   Elige una escala predefinida para tus tokens:

   - Sistema de Cuadrícula de 4 Puntos
   - Sistema de Cuadrícula de 8 Puntos
   - Escala Modular (basada en multiplicador)
   - Intervalos Personalizados
   - Escala Fibonacci

5. **Establece el Número de Valores**  
   Especifica cuántos valores de espaciado quieres generar (ej., 6 valores para una escala de pequeño a grande).

6. **Elige la Convención de Nomenclatura**  
   Selecciona un patrón de nomenclatura para tus tokens de espaciado:

   - Tallas (xs, sm, md, lg, xl)
   - Incremental (100, 200, 300)
   - Ordinal (1, 2, 3)
   - Alfabética (A, B, C o a, b, c)

7. **Vista Previa de tus Tokens**  
   El maguito mostrará la vista previa de tus tokens de espaciado:

   ```
   Nombre: Space
   ┌─────────┬─────────┐
   │ Escala  │ Valor   │
   ├─────────┼─────────┤
   │ 01      │ 16px    │
   │ 02      │ 24px    │
   │ 03      │ 32px    │
   │ 04      │ 40px    │
   └─────────┴─────────┘
   ```

8. **Genera tus Artefactos**  
   Una vez confirmado, el maguito:

   - Exporta tus tokens en formato Tokens Studio JSON
     Almacenado en: `output_files/tokens/space/space_tokens_{unit}.json`
   - Crea archivos CSS y SCSS con tus tokens como variables
     Almacenado en `output_files/tokens/css/space/space_variables_{unit}.css` y `output_files/tokens/scss/space/space_variables_{unit}.scss`

9. **Finaliza tu Hechizo**  
   Revisa los archivos de salida e integra tus tokens de espaciado en tu sistema.

---