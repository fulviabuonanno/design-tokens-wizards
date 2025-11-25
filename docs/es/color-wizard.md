## 🎨 **Maguito de Tokens de Color**

<img src="src/assets/color_wiz.png" alt="Color Wizard" width="200">

![Color Wizard](https://img.shields.io/badge/Color%20Wiz-v2.12.0-yellow)

¡Conjura una paleta deslumbrante para tu sistema de diseño con el Maguito de Tokens de Color 🧙! Este script mágico te guía a través de cada paso para crear tokens de color flexibles y escalables, sin necesidad de libro de hechizos.

## Características

- **Estructura de Tokens Flexible:** Organiza colores con categorías y niveles de nomenclatura opcionales
- **Procesamiento por Lotes:** Agrega múltiples colores a la vez con configuración de escala compartida
- **Configuraciones Predefinidas:** Inicio rápido con escalas de color estándar de la industria (Tailwind, Material Design, y más)
- **Escalas Personalizadas:** Control total sobre tipos de escala (incremental, ordinal, alfabético, semántico)
- **Múltiples Formatos de Salida:** Exporta a HEX, RGB, RGBA, HSL y OKLCH
- **Archivos Autogenerados:** Tokens JSON, variables CSS y variables SCSS listos para usar

---

## Cómo Usar

### 1. **Invoca el Maguito**

Lanza el hechizo de color en tu terminal:

```sh
npm run color
```

### 2. **Elige el Tipo de Token**

Selecciona la base de tus tokens de color:

- **Colores Globales**
- **Colores Semánticos** (próximamente; actualmente redirige a Global)

### 3. **Establece la Categoría**

(Opcional) Organiza tus tokens por categoría (ej., primitivos, fundamentos, núcleo, básicos, esenciales, global, raíces, o personalizado). Ingresa el tuyo si lo deseas.

### 4. **Establece el Nivel de Nomenclatura**

(Opcional) Añade un nivel de nomenclatura para mayor claridad (ej., color, colour, paleta, esquema, o personalizado).

### 5. **Elige el Modo de Color** ✨

Selecciona cómo quieres agregar colores:

- **Color Individual:** Agrega un color a la vez (flujo tradicional)
- **Modo por Lotes:** Agrega múltiples colores a la vez con la misma configuración de escala

### 6. **Entrada de Color**

Dependiendo de tu elección de modo:

**Modo Color Individual:**

- Ingresa un código de color HEX (ej., `#FABADA`)
- Vista previa de tu tono mágico
- Dale a tu color un nombre único (ej., `azul`, `amarillo`, `rojo`)

**Modo por Lotes:**

Elige tu método de entrada:

- **Entrada Masiva:** Pega múltiples códigos HEX a la vez
  - Separa los códigos con comas (`,`) o punto y coma (`;`)
  - Con o sin el símbolo `#` (ej., `#FF5733, 3498DB; 2ECC71` o `FF5733,3498DB,2ECC71`)
  - Nombra cada color después de ingresar todos los códigos
- **Entrada Individual:** Agrega colores uno a la vez
  - Ingresa el código HEX y el nombre para cada color
  - Elige agregar más colores cuando estés listo

¡Todos los colores en modo por lotes compartirán la misma configuración de escala, acelerando drásticamente la creación de paletas!

### 7. **Configuración de Escala**

**Elige el Método de Configuración:**

- **🎯 Usar una Preconfiguración:** Inicio rápido con configuraciones estándar de la industria
- **⚙️ Configuración Personalizada:** Control total sobre todas las opciones

**Si Usas Preconfiguraciones:**

Selecciona entre preconfiguraciones categorizadas diseñadas para casos de uso comunes:

- **Inspirado en Tailwind:** Escalas estilo Tailwind (10 u 11 stops con nomenclatura incremental)
- **Material Design:** Sistemas de color de Google Material Design
- **Inicio Rápido:** Escalas simples y listas para usar para prototipado rápido
- **Compacto:** Escalas minimalistas con menos stops para proyectos ligeros

Cada preconfiguración incluye ajustes predefinidos para:

- Tipo de escala (incremental, ordinal, alfabético o semántico)
- Número de stops
- Porcentajes de rango de mezcla
- Formato de nomenclatura

**Si Usas Configuración Personalizada:**

Decide cómo se generarán tus paradas de color:

- **Incremental:** 100, 200, 300, 400
- **Ordinal:** 01, 02, 03, 04 o 1, 2, 3, 4
- **Alfabético:** A, B, C, D o a, b, c, d
- **Stops Semánticos:** dark, base, light, etc.

Luego elige cuántos stops (tonos) generar (1-20, dependiendo del tipo de escala).

Opcionalmente personaliza el rango de mezcla de color: Establece los porcentajes mínimos y máximos de mezcla (predeterminado: 10%-90%) para controlar cómo tu color base se mezcla con blanco y negro para los stops más claros y oscuros.

### 8. **Vista Previa y Confirma**

Revisa tu(s) escala(s) de color en una tabla, completa con nombres de tokens y valores HEX.

- Para colores individuales: Vista previa completa con todas las paradas mostradas
- Para modo por lotes: Vista previa del primer color con un resumen de los colores adicionales

Puedes establecer el tono medio como `base` si lo deseas. Confirma para continuar o reinicia para ajustar.

### 9. **Expande tu Paleta**

Añade más colores y repite el proceso tantas veces como quieras.

### 10. **Exporta y Convierte**

Cuando termines, el maguito:

- Exporta los tokens en formato Tokens Studio JSON (HEX por defecto)
- Ofrece convertir los tokens a RGB, RGBA, HSL y/o OKLCH
- Genera archivos CSS y SCSS para cada formato
- Limpia archivos no utilizados

Tus artefactos mágicos aparecerán en:

- JSON: `output_files/tokens/json/color/color_tokens_{format}.json`
- CSS: `output_files/tokens/css/color/color_variables_{format}.css`
- SCSS: `output_files/tokens/scss/color/color_variables_{format}.scss`

### 11. **Revisa tu Hechizo**

El maguito lista todos los archivos actualizados, nuevos y eliminados.

---

**Nota:**

- El soporte para colores semánticos está planeado pero aún no disponible.
- Todos los pasos permiten entrada personalizada y confirmación antes de continuar.
- El maguito asegura que no haya nombres de color duplicados en tu estructura elegida.
- Siempre puedes reiniciar un paso para ajustar tu entrada.

---
