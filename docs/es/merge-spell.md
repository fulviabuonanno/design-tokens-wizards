## 🔄 **Hechizo de Fusión de Tokens**

<img src="src/assets/merge_spell.png" alt="Merge Spell" width="200">

Versión 1.3.2

¡Conjura un sistema de diseño unificado fusionando tus archivos de tokens con el Hechizo de Fusión de Tokens 🧙! Este hechizo combina múltiples archivos de tokens en un único archivo cohesivo del sistema de diseño.

1. **Invoca el Hechizo**  
   Lanza el hechizo de fusión en tu terminal:

   ```sh
   npm run merge
   ```

2. **Selecciona los Archivos de Tokens**  
   Elige los archivos de tokens que quieres fusionar:

   - Tokens de color
   - Tokens de tipografía
   - Tokens de espaciado
   - Tokens de tamaño
   - Tokens de radio de borde

3. **Configura los Formatos de Tokens**  
   El hechizo revisará automáticamente qué archivos están disponibles en tu carpeta `output/tokens`. Para cada tipo de token encontrado, selecciona tu formato preferido:

   - Colores: Elige entre HEX, RGB, RGBA, HSL o OKLCH
   - Tipografía: Selecciona unidades (px, rem, em)
   - Espaciado: Elige unidades (px, rem, em)
   - Tamaño: Selecciona unidades (px, rem, em)
   - Radio de Borde: Elige unidades (px, rem, em)

4. **Elige la Convención de Nomenclatura**  
   Selecciona cómo quieres que se nombren tus tokens en el archivo fusionado:

   - camelCase (ej., primaryColor, fontSize)
   - kebab-case (ej., primary-color, font-size)
   - snake_case (ej., primary_color, font_size)
   - PascalCase (ej., PrimaryColor, FontSize)

5. **Genera tus Artefactos**  
   Una vez confirmado, el hechizo:

   - Creará un archivo de tokens fusionado en formato Tokens Studio JSON
     Almacenado en: `output_files/final/tokens.json`
   - Creará archivos CSS y SCSS con todos tus tokens como variables
     Almacenado en `output_files/final/tokens.css` y `output_files/final/tokens.scss`

6. **Finaliza tu Hechizo**  
   Revisa los archivos fusionados e intégralos en tu sistema de diseño.

---

**Nota:**

- El hechizo asegura que todos tus tokens se combinen correctamente.
- Siempre puedes reiniciar un paso para ajustar tu selección.
- Los archivos fusionados están listos para usar en tu flujo de trabajo de desarrollo.

---