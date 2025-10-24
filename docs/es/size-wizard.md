## 📏 **Maguito de Tokens de Tamaño**

<img src="src/assets/size_wiz.png" alt="Size Wizard" width="200">

Versión 1.7.2

¡Conjura el sistema de tamaños perfecto para tu diseño con el Maguito de Tokens de Tamaño 🧙! Este maguito te ayuda a crear un conjunto armonioso de tokens de tamaño que traerán consistencia y precisión a tus diseños.

1. **Invoca el Maguito**  
   Lanza el hechizo de tamaño en tu terminal:

   ```sh
   npm run size
   ```

2. **Define la Unidad Base**  
   La unidad base predeterminada para los tokens de tamaño es píxeles (px).

3. **Nombra tus Tokens de Tamaño**  
   Proporciona un nombre para tus tokens de tamaño (ej., size, sz).

4. **Selecciona el Tipo de Escala**  
   Elige una escala predefinida para tus tokens:

   - Sistema de Cuadrícula de 4 Puntos
   - Sistema de Cuadrícula de 8 Puntos
   - Escala Modular (basada en multiplicador)
   - Intervalos Personalizados
   - Escala Fibonacci

5. **Establece el Número de Valores**  
   Especifica cuántos valores de tamaño quieres generar (ej., 6 valores para una escala de pequeño a grande).

6. **Elige la Convención de Nomenclatura**  
   Selecciona un patrón de nomenclatura para tus tokens de tamaño:

   - Tallas (xs, sm, md, lg, xl)
   - Incremental (100, 200, 300)
   - Ordinal (1, 2, 3)
   - Alfabética (A, B, C o a, b, c)

7. **Vista Previa de tus Tokens**  
   El maguito mostrará la vista previa de tus tokens de tamaño:

   ```
   Nombre: Size
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
     Almacenado en: `output_files/tokens/size/size_tokens_{unit}.json`
   - Crea archivos CSS y SCSS con tus tokens como variables
     Almacenado en `output_files/tokens/css/size/size_variables_{unit}.css` y `output_files/tokens/scss/size/size_variables_{unit}.scss`

9. **Finaliza tu Hechizo**  
   Revisa los archivos de salida e integra tus tokens de tamaño en tu sistema.

---