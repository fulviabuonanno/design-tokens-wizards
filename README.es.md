![Banner de Design Tokens Wizards](src/assets/banner.png)

![Licencia: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/node-%3E=20.11.0-brightgreen)

[English](./README.md) | [Español](./README.es.md)

Una potente colección de scripts para generar y gestionar tokens de diseño para tu sistema de diseño. Cada maguito se especializa en crear tipos específicos de tokens, garantizando consistencia y eficiencia en tus proyectos.

## 📋 Tabla de Contenidos

- [🧙 Primeros Pasos](#-primeros-pasos)
- [🗂 Estructura del Proyecto](#-estructura-del-proyecto)
- [✨ Maguitos y Hechizos](#-maguitos-y-hechizos)
- [📦 Dependencias](#-dependencias)
- [📝 Licencia](#-licencia)
- [❓ Solución de Problemas y Preguntas Frecuentes](#-solución-de-problemas-y-preguntas-frecuentes)
- [📬 Contacto y Soporte](#-contacto-y-soporte)
- [🤝 Contribución](#-contribución)

## 🧙 Primeros Pasos

1. **Instala Node.js**  
   Descarga e instala [Node.js](https://nodejs.org/) en tu ordenador.

2. **Instala VS Code**  
   Descarga e instala [Visual Studio Code](https://code.visualstudio.com/) para una experiencia de desarrollo mejorada.

3. **Abre la Terminal**

   - **VS Code:** Presiona `` Ctrl + ` `` (Windows/Linux) o `` Cmd + ` `` (Mac)
   - **Terminal del Sistema:**
     - Windows: `Windows + R`, escribe `cmd`
     - Mac: `Command + Space`, escribe `terminal`
     - Linux: `Ctrl + Alt + T`

4. **Descarga/Clona el Repositorio**

   [Descargar ZIP](https://github.com/fulviabuonanno/design-tokens-wizards/archive/refs/heads/master.zip)

   o

   Clonar Repo

   ```sh
   git clone https://github.com/fulviabuonanno/design-tokens-wizards.git
   cd design-tokens-wizards
   ```

5. **Dependencias**

   El repositorio incluye todas las dependencias necesarias (node_modules) para que puedas ejecutar los maguitos inmediatamente sin instalar nada.

6. **Ejecuta los Scripts**  
   Elige entre los siguientes maguitos:

| Maguito de Tokens        | Nombre del Script | Comando         | Descripción                            | Versión |
| ------------------------ | ----------------- | --------------- | -------------------------------------- | ------- |
| 🟡 **COLOR WIZ**         | `color-wiz.js`    | `npm run color` | Genera y gestiona tokens de color      | ![Color Wizard](https://img.shields.io/badge/Color%20Wiz-v2.11.0-yellow) |
| 🔴 **TYPOGRAPHY WIZ**    | `typo_wiz.js`     | `npm run typo`  | Genera y gestiona tokens de tipografía | ![Typography Wizard](https://img.shields.io/badge/Typography%20Wiz-v1.2.3-red) |
| 🟣 **SPACE WIZ**         | `space_wiz.js`    | `npm run space` | Genera y gestiona tokens de espaciado  | ![Space Wizard](https://img.shields.io/badge/Space%20Wiz-v1.7.2-blueviolet) |
| 🔵 **SIZE WIZ**          | `size_wiz.js`     | `npm run size`  | Genera y gestiona tokens de tamaño     | ![Size Wizard](https://img.shields.io/badge/Size%20Wiz-v1.7.2-blue) |
| 🟢 **BORDER RADIUS WIZ** | `radii_wiz.js`    | `npm run radii` | Genera y gestiona tokens de radio      | ![Border Radius Wizard](https://img.shields.io/badge/Border%20Radius%20Wiz-v1.7.2-green) |

| Hechizo         | Nombre del Script | Comando         | Descripción                                      | Versión |
| --------------- | ----------------- | --------------- | ------------------------------------------------ | ------- |
| **MERGE SPELL** | `merge_spell.js`  | `npm run merge` | Combina todos los archivos de tokens en uno solo | ![Merge Spell](https://img.shields.io/badge/Merge%20Spell-v1.3.3-orange) |
| **CLEAR SPELL** | `clear_spell.js`  | `npm run clear` | Elimina todos los archivos generados de una vez  | ![Clear Spell](https://img.shields.io/badge/Clear%20Spell-v1.2.2-lightgrey) |

## 🗂 Estructura del Proyecto

```
src/
  wizards/         # Todos los scripts de Maguitos (color, typo, space, size, radii)
  spells/          # Scripts de utilidad (merge, clear)
  config/          # Configuración y scripts auxiliares
  assets/          # Imágenes y otros recursos estáticos
output_files/      # Donde se guardan los tokens generados
  tokens/
    json/          # Archivos de tokens en JSON
    css/           # Archivos de tokens en CSS
    scss/          # Archivos de tokens en SCSS
  final/           # Archivos finales de tokens combinados
pdf/               # Documentación en PDF
docs/
  en/              # Documentación en inglés
  es/              # Documentación en español
```

## ✨ Maguitos y Hechizos

Este proyecto proporciona una serie de "maguitos" y "hechizos" para ayudarte a gestionar tus tokens de diseño.

### Maguitos

*   [🎨 Maguito de Tokens de Color](./docs/es/color-wizard.md)
*   [🔤 Maguito de Tokens de Tipografía](./docs/es/typography-wizard.md)
*   [🔳 Maguito de Tokens de Espaciado](./docs/es/space-wizard.md)
*   [📏 Maguito de Tokens de Tamaño](./docs/es/size-wizard.md)
*   [🔲 Maguito de Tokens de Radio de Borde](./docs/es/border-radius-wizard.md)

### Hechizos

*   [🧹 Hechizo de Limpieza de Tokens](./docs/es/clear-spell.md)
*   [🔄 Hechizo de Fusión de Tokens](./docs/es/merge-spell.md)

## Creado con Amor en Barcelona por Fulvia Buonanno 🪄❤️

![Foto de Perfil](src/assets/profile_pic.png)

Descubre más sobre los maguitos en: [Sitio Web de Design Tokens Wizards](https://www.designtokenswizards.com)

Si eres apasionado por los sistemas de diseño y los tokens, esta herramienta es tu compañera perfecta, permitiéndote crear tokens sin esfuerzo. Para los fanáticos de RPG o JRPG, esta herramienta evocará una sensación de nostalgia, combinando vibraciones de juegos clásicos con tu flujo de trabajo de diseño. 🧩

Creado con amor por Fulvia Buonanno, una Diseñadora de Sistemas de Diseño basada en Barcelona, esta herramienta tiene como objetivo cerrar la brecha entre el diseño y el desarrollo, haciendo que los tokens sean más accesibles, especialmente para los recién llegados a este mundo mágico. 🧙

## 📦 Dependencias

A continuación se muestra una lista completa de todas las dependencias utilizadas en este proyecto:

| Dependencia                              | Versión | Descripción                                                          | Repositorio                                                                                                          |
| ---------------------------------------- | ------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **@builtwithjavascript/oklch-converter** | ^0.9.2  | Convertidor de espacio de color OKLCH                                | [npmjs.com/@builtwithjavascript/oklch-converter](https://www.npmjs.com/package/@builtwithjavascript/oklch-converter) |
| **chalk**                                | ^5.4.1  | Estilizado de cadenas de terminal hecho bien                         | [chalk/chalk](https://github.com/chalk/chalk)                                                                        |
| **cli-table3**                           | ^0.6.5  | Tablas unicode bonitas para la línea de comandos                     | [cli-table3](https://github.com/cli-table/cli-table3)                                                                |
| **inquirer**                             | ^12.4.2 | Una colección de interfaces de usuario comunes de línea de comandos  | [SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js)                                                    |
| **path**                                 | ^0.12.7 | Módulo path de Node.js                                               | [nodejs/node](https://github.com/nodejs/node)                                                                        |
| **tinycolor2**                           | ^1.6.0  | Manipulación y conversión de color rápida y pequeña                  | [bgrins/TinyColor](https://github.com/bgrins/TinyColor)                                                              |

---

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Esto significa que eres libre de usar, modificar y distribuir el software siempre que se incluya el aviso de copyright original y el aviso de permiso en todas las copias o partes sustanciales del software.

Para más detalles, puedes leer el texto completo de la licencia en el archivo [LICENSE](./LICENSE) incluido en este repositorio o visitar la Iniciativa de Código Abierto para más información.

---

## ❓ Solución de Problemas y Preguntas Frecuentes

**P: ¿Cómo puedo proporcionar comentarios o reportar problemas?**  
R: ¡Bienvenimos tus comentarios! Puedes:

- Contactarnos en nuestro [sitio web](https://www.designtokenswizards.com)
- Completar este [formulario](https://tally.so/r/m6V6Po/)

Tus comentarios nos ayudan a mejorar la herramienta y hacerla mejor para todos. Estamos particularmente interesados en:

- Reportes de errores
- Solicitudes de características
- Mejoras en la documentación
- Comentarios sobre la experiencia de usuario
- Problemas de rendimiento

**P: ¿Recibo un error de permiso o "comando no encontrado"?**  
R: Asegúrate de tener Node.js (v18+) instalado y de estar ejecutando comandos desde la raíz del proyecto.

**P: ¿Dónde están mis archivos generados?**  
R: Revisa el directorio `output_files/`.

**P: ¿Cómo reinicio/limpio todos los archivos generados?**  
R: Ejecuta `npm run clear` para eliminar toda la salida generada.

**P: ¿Puedo usar estos tokens con mi herramienta de diseño?**  
R: ¡Sí! Los tokens se exportan en múltiples formatos (JSON, CSS, SCSS) que pueden usarse con la mayoría de las herramientas de diseño y entornos de desarrollo.

**P: ¿Cómo actualizo los tokens después de hacer cambios?**  
R: Simplemente ejecuta el maguito nuevamente con tus nuevos valores. Los archivos se actualizarán automáticamente.

**P: ¿Puedo personalizar la convención de nomenclatura para mis tokens?**  
R: ¡Sí! Cada maguito te permite elegir entre diferentes convenciones de nomenclatura (tallas, números incrementales, números ordinales, etc.).

**P: ¿Cuál es la diferencia entre el Hechizo de Fusión y el Hechizo de Limpieza?**  
R: El Hechizo de Fusión combina todos tus archivos de tokens en un único archivo unificado, mientras que el Hechizo de Limpieza elimina todos los archivos generados para comenzar de nuevo.

**P: ¿Cómo contribuyo al proyecto?**  
R: Consulta nuestra sección de [Contribución](#-contribución) para ver las pautas. ¡Bienvenimos todas las contribuciones!

**P: ¿Puedo usar estos tokens en mi proyecto comercial?**  
R: ¡Sí! Este proyecto está licenciado bajo MIT, lo que significa que puedes usarlo libremente en cualquier proyecto, incluyendo comerciales.

**P: ¿Qué formatos de color son compatibles?**  
R: El maguito de Tokens de Color es compatible con formatos HEX, RGB, RGBA, HSL y OKLCH. Puedes elegir tu formato preferido durante el proceso de generación.

**P: ¿Puedo usar fuentes personalizadas en el maguito de Tipografía?**  
R: ¡Sí! Puedes especificar cualquier familia de fuentes, incluyendo fuentes personalizadas. Solo asegúrate de incluir alternativas adecuadas para una mejor compatibilidad multiplataforma.

**P: ¿Qué unidades son compatibles para espaciado y tamaño?**  
R: Los maguitos de Espaciado y Tamaño son compatibles con unidades px, rem y em. Puedes elegir tu unidad preferida durante el proceso de generación.

**P: ¿Cómo mantengo la consistencia entre diferentes proyectos?**  
R: Usa el Hechizo de Fusión para combinar tokens de diferentes proyectos, y considera crear una biblioteca de tokens para componentes compartidos.

**P: ¿Cuál es la mejor manera de organizar mis archivos de tokens?**  
R: Recomendamos organizar los tokens por categoría (color, tipografía, espaciado, etc.) y usar el Hechizo de Fusión para combinarlos cuando sea necesario.

**P: ¿Puedo automatizar la generación de tokens en mi pipeline de CI/CD?**  
R: ¡Sí! Los maguitos pueden ejecutarse desde la línea de comandos, lo que los hace perfectos para la automatización en tu flujo de trabajo de desarrollo.

**P: ¿Puedo usar estos tokens con mi framework CSS?**  
R: ¡Sí! Los tokens se exportan en formatos estándar (CSS, SCSS) que pueden usarse con cualquier framework CSS o CSS vanilla.

**P: ¡Algo más no funciona!**  
R: Por favor [abre un issue](https://github.com/fulviabuonanno/design-tokens-wizards/issues) o [contáctame](mailto:designtokenswizards@gmail.com).

---

## 🤝 Contribución

### ☕️ Apoya el Proyecto

Si encuentras esta herramienta útil y quieres mostrar tu aprecio, ¡considera invitarme un café! Tu apoyo me ayuda a mantener y mejorar los Design Tokens Wizards, haciéndolo aún más mágico para todos.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/fbuonanno)

Cada café me ayuda a:

- Añadir nuevas características y mejoras
- Corregir errores y mantener el código
- Crear más documentación y ejemplos
- ¡Mantener la magia viva! ✨

Incluso una pequeña contribución hace una gran diferencia en mantener este proyecto prosperando. ¡Gracias por ser parte de nuestra comunidad mágica! 🧙‍♀️

---