# design-tokens-wizards 🪄🧙🎨

Hello, Design System aficionados! 🦄✨ Welcome to **`design-tokens-wizards`** — the enchanting scripts that helps you craft design tokens in just a few simple steps... as if by magic! 🪄✨

With **`design-tokens-wizards`**, you'll unlock:

- **Enforce Naming Conventions:** Harness the power of our Design System lexicon to imbue each token with a spellbinding, standardized identity.
- **Efficiency:** Conjure up multiple formats for color, size, and spacing tokens automatically — no wand waving needed!
- **Integration:** Effortlessly blend with Tokens Studio and other design systems, like a flawless unicorn-universe connection.
- **Flexibility:** Customize your workflow with a sprinkle of pixie dust to fit your project's unique needs.
- **Ready-to-Test:** Focus on making decisions, not on how to structure your tokens. Let the magic handle the setup!
- **Ready-to-CSS/SCSS:** Have your tokens instantly converted into variables, ready for development's testing phase.

Ready to let your creativity soar on the wings of a unicorn? 🦄✨ Let's get started and cast some design magic together!

---

### 🛠️ **How to Use:**

1. **Install Node.JS**
   To use the scripts, you need to have **Node.js** installed on your machine. You can download and install it from [Node.js official website](https://nodejs.org/).

2. **Run the Script**

Select the wizard that will come to your aid by executing the corresponding script in your terminal. Below is a list of available wizards:

| Token Wizard             | Script Name    | Run Command     | Description                              | Version  |
| ------------------------ | -------------- | --------------- | ---------------------------------------- | -------- |
| 🟡 **COLOR WIZ**         | `color-wiz.js` | `npm run color` | Generate and manage color tokens         | 2.3.0 🆕 |
| 🔵 **SIZE WIZ**          | `size_wiz.js`  | `npm run size`  | Generate and manage size tokens          | 1.5.0 🆕 |
| 🟣 **SPACE WIZ**         | `space_wiz.js` | `npm run space` | Generate and manage spacing tokens       | 1.5.0 🆕 |
| 🟢 **BORDER RADIUS WIZ** | `radii_wiz.js` | `npm run radii` | Generate and manage border radius tokens | 1.5.0 🆕 |
| 🔴 **TYPOGRAPHY WIZ**    | `typo_wiz.js`  | `npm run typo`  | Generate and manage typography tokens    | 1.0.1 🔥 |
| **SHADOW WIZ**           | Coming Soon    | –               | Generate and manage shadow tokens        | –        |
| **OPACITY WIZ**          | Coming Soon    | –               | Generate and manage opacity tokens       | –        |

Below is a curated collection of spells (crafted by our Token's Wizards to come to your aid) to streamline your design tokens workflow:

| Spell           | Script Name      | Run Command     | Description                                            | Version  |
| --------------- | ---------------- | --------------- | ------------------------------------------------------ | -------- |
| **MERGE SPELL** | `merge_spell.js` | `npm run merge` | Combine all token files into a single unified file     | 1.2.0 🆙 |
| **CLEAR SPELL** | `clear_spell.js` | `npm run clear` | Remove all generated output files in one swift command | 1.2.0 🆙 |

---

### 🎨 **Color Tokens Wizard** ✨

Version 2.3.0

Managing color tokens can sometimes feel as magical as mastering alchemy, but with the Color Tokens Wizard 🧙, your journey to conjuring a luminous palette is a breeze. Begin with a base hue that will set the spellbinding tone, and the wizard will guide you through creating a dazzling spectrum of tokens. Whether you're defining a signature brand shade or curating an entire color system, let this wizard transform your creative vision into vibrant reality.

1. **Invoke the Spell**  
   Begin your journey by running the Color Tokens Wizard script. Open your terminal and cast the spell with:

   ```sh
   npm run color
   ```

2. **Summon a Base Color**  
   Provide a HEX color code (e.g., `#FABADA`) when prompted. This will be the essence from which all your color stops are derived.

3. **Define Your Color Identity**  
   Name your color token – whether it represents a global hue, a brand element, or a specific UI background.  
   _Example: `blue`, `yellow`, or `red`._

   **Note:** This wizard currently supports the creation of **global colors** only.

4. **Select and Customize the Scale**  
   Choose the scale type that best suits your magical needs:

   - **Incremental:** Generate stops using an incremental step (e.g., 10, 50, or 100).
   - **Ordinal:** Create a sequence (e.g., 01, 02, 03… or 1, 2, 3…).
   - **Shades Semantic:** Generate semantic stops with labels like `ultra-dark`, `darkest`, `darker`, `dark`, `semi-dark`, `base`, `semi-light`, `light`, `lighter`, `lightest`, and `ultra-light`.

5. **Behold the Preview**  
   The wizard will cast a preview spell showing your color's preview along with the stops table. You'll see something like:

   ```
   Type: Global  Name: blue
   ┌─────────┬───────────┬─────────┐
   │ Scale   │ HEX       │ Sample  │
   ├─────────┼───────────┼─────────┤
   │ base    │ #FABADA   │ [🪄]    │
   │ 01      │ #F0E3D2   │ [🪄]    │
   │ 02      │ #E6D6BF   │ [🪄]    │
   │ ...     │ ...       │ ...     │
   └─────────┴───────────┴─────────┘
   ```

   Here, the wizard ensures that the `"base"` token always appears at the top of your stops table.

6. **Confirm Your Enchantment**  
   Review the preview and confirm if the nomenclature and scale feel right for your design magic. If not, you can re-select the scale until the spell feels just perfect.

7. **Generate Your Artifacts**  
   Once confirmed, the wizard will:

   - Export your tokens in Tokens Studio JSON format:
     Stored in: `output_files/tokens/color` as `color_tokens_{format}.json`
   - Conjure CSS and SCSS files with your tokens as variables.
     Stored in `output_files/tokens/css/` and `output_files/tokens/scss/` respectively as: `color_variables_{format}.css` and `color_variables_{format}.scss`

8. **Expand Your Palette**  
   Should your creative spirit desire more color magic, simply add "more colors to the same group" and repeat the process. The wizard is always ready to extend your enchanted palette.

9. **Finalize the Spell**  
   Review the output files (listed as updated, saved, or deleted) and relish the magic you've created. Your design tokens are now fully prepared for integration into your design system.

---

**Note:** Additional semantic color capabilities are on the way to elevate your design magic even further!

Let the art of token crafting infuse your project with endless creativity—and may your colors forever dazzle!

---

### 📏 **Size Tokens Wizard** ✨

Version 1.5.0

## Size Tokens Wizard ✨

Managing size tokens can be daunting, but with the Size Tokens Wizard 🧙, you can streamline the process and save valuable time. Start with a base size, and let the wizard generate a range of size tokens in various units, ready for integration into your design system and development projects.

1. **Run the Size Wiz Script**  
   Begin by running the Size Wiz script to initialize the process. Open your terminal and execute:

   ```sh
   npm run size
   ```

2. **Define the Base Unit**  
   The default base unit for size tokens is pixels (px).

3. **Name Your Size Tokens**  
   Provide a name for your size tokens (e.g., size, dimension).

4. **Select a Scale**  
   Choose from the predefined scales:

   - **4-Point Grid System**
   - **8-Point Grid System**
   - **Modular Scale** (multiplier based)
   - **Custom Intervals**
   - **Fibonacci Scale**

5. **Define the Number of Values**  
   Specify how many size values you want to generate (e.g., 6 values for a small-to-large scale).

6. **Choose Naming Criteria**  
   Select a naming pattern for your size tokens:

   - **T-shirt Sizes**: (xs, sm, md, lg, xl)
   - **Incremental Numbers**: (100, 200, 300)
   - **Ordinal Numbers**: (1, 2, 3)
   - **Alphabetical**: (A, B, C or a, b, c)

7. **Preview the Tokens**

   ```
      Name: Size
      ┌─────────┬─────────┐
      │ Scale   │ Value   │
      ├─────────┼─────────┤
      │ 01      │ 16px    │
      │ 02      │ 24px    │
      │ 03      │ 32px    │
      │ 04      │ 40px    │
      └─────────┴─────────┘
   ```

Review the preview and confirm if the size tokens meet your requirements.

If adjustments are needed, simply re-run the wizard until the desired output is achieved.

8. **Generate Size Tokens**  
   The script will generate a list of size tokens based on your chosen scale and naming criteria.

9. **Convert to Other Units (Optional)**  
   By default, tokens are stored in pixels (px), but you can also convert them to:

   - **Rem (rem)**
   - **Em (em)**

10. **Export Size Tokens**  
    The script exports your size tokens in Tokens Studio JSON format, making them ready for integration into your design system.  
    Stored in: `output_files/tokens/size/size_tokens_{unit}.json`

11. **Generate CSS & SCSS Files**  
    Automatically create CSS and SCSS files with your size tokens as variables:
    - **CSS**: Stored in `output_files/tokens/css/size/size_variables_{unit}.css`
    - **SCSS**: Stored in `output_files/tokens/scss/size/size_variables_{unit}.scss`

---

### 🔳 **Space Tokens Wizard** ✨

Version 1.5.0

Creating and managing space tokens can be a daunting task, but with the Space Tokens Wizard 🧙, you can streamline the process and save precious time. Begin with a base space value, and the wizard will generate a variety of space tokens in different units, ready for integration into your design system and development projects.

1. **Run the Space Wiz Script**  
   Begin by running the Space Wiz script to start the process. Open your terminal and execute the following command:

   ```sh
   npm run space
   ```

2. **Define the Base Unit**  
   The default base unit for space tokens is pixels (px).

3. **Name Your Space Tokens**  
   Provide a name for your space tokens (e.g., space, spc).

4. **Select a Scale**  
   Choose a predefined scale for your tokens:

- **4-Point Grid System**
- **8-Point Grid System**
- **Modular Scale** (multiplier based)
- **Custom Intervals**
- **Fibonacci Scale**

5. **Define the Number of Values**  
   Specify how many space values you want to generate (e.g., 6 values for a small-to-large scale).

6. **Choose Naming Criteria**  
   Select a naming pattern for your space tokens:

   - **T-shirt Sizes**: (xs, sm, md, lg, xl)
   - **Incremental Numbers**: (100, 200, 300)
   - **Ordinal Numbers**: (1, 2, 3)
   - **Alphabetical**: (A, B, C or a, b, c)

7. **Preview the Tokens**

   ```
      Name: Size
      ┌─────────┬─────────┐
      │ Scale   │ Value   │
      ├─────────┼─────────┤
      │ 01      │ 16px    │
      │ 02      │ 24px    │
      │ 03      │ 32px    │
      │ 04      │ 40px    │
      └─────────┴─────────┘
   ```

8. **Generate Space Tokens**  
   The script will generate a list of space tokens based on the chosen scale and naming criteria.

9. **Convert to Other Units (Optional)**  
   By default, tokens are stored in pixels (px), but you can also convert them to:

   - **Rem (rem)**
   - **Em (em)**

10. **Export Space Tokens**  
    The script exports your space tokens in Tokens Studio format as JSON files, making them ready for integration into your design system.
    Stored in: `output_files/tokens/space/space_tokens*{unit}.json`

11. **Generate CSS & SCSS Files**  
    Automatically create CSS and SCSS files with your space tokens as variables:
    - **CSS**: Stored in `output_files/tokens/css/space/space_variables_{unit}.css`
    - **SCSS**: Stored in `output_files/tokens/scss/space/space_variables_{unit}.scss`

---

### ⭕️ **Border Radius Tokens Wizard** ✨

Version 1.5.0

Creating border-radius tokens is simplified with the Border Radius Tokens Wizard 🧙. This wizard guides you through defining and generating border-radius tokens for your design system, ready to be used in various formats including JSON, CSS, and SCSS.

1. **Run the Border Radius Wizard Script**  
    Start by running the wizard script. Open your terminal and execute the following command:

   ```sh
   npm run radii
   ```

2. **Define the Token Name**  
   Choose a name for your border-radius tokens (e.g., `border-radius`, `corner-radius`, `radius`).

3. **Select Scale Structure**  
   Decide whether to include 'none' and 'full' values for the border radius.

4. **Define Intermediate Steps**  
   Optionally, add intermediate steps for a more granular scale:

   - **T-shirt Sizes:** (xs, sm, md, lg, xl)
   - **Incremental Numbers:** (100, 200, 300, 400)
   - **Ordinal Numbers:** (01, 02, 03, 04 or 1, 2, 3, 4)
   - **Alphabetical:** (A, B, C, D or a, b, c, d)
   - **Semantic:** (subtle, soft, moderate, bold)

5. **Define Value Scale**  
   Select a value scale based on either minimal or expressive bases:

- **4-Point Grid System**
- **8-Point Grid System**
- **Modular Scale** (multiplier based)
- **Custom Intervals**
- **Fibonacci Scale**

6. **Preview the Tokens**

```
   Name: border radius
   ┌─────────┬────────────────────────┐
   │ Scale   │ Value                  │
   ├─────────┼────────────────────────┤
   │ None    │ 0px                    │
   │ 01      │ 4px                    │
   │ 02      │ 8px                    │
   │ 03      │ 12px                    │
   │ Full    │ 9999px                 │
   └─────────┴────────────────────────┘
```

8. **Generate Border Radius Tokens**  
   The script generates a list of border-radius tokens based on your input.

9. **Convert to Other Units (Optional)**  
   Convert tokens to other units such as:

   - **Rem (rem)**

10. **Export Border Radius Tokens**  
    The tokens are exported in Tokens Studio format as JSON files, ready for integration into your design system.
    Stored in: `output_files/tokens/border-radius/border_radius_tokens*{unit}.json`

11. **Generate CSS & SCSS Files**  
    Automatically create CSS and SCSS files with your border-radius tokens as variables:

- **CSS:** Stored in `output_files/tokens/css/border-radius/border_radius_variables_{unit}.css`
- **SCSS:** Stored in `output_files/tokens/scss/border-radius/border_radius_variables_{unit}.scss`

---

### 🔤 Typography Tokens Wizard ✨

Version 1.0.1 🔥 🔥

The Typography Tokens Wizard 🧙 is your enchanted companion for crafting a comprehensive typography system. Like a skilled alchemist mixing potent ingredients, this wizard helps you blend font families, sizes, weights, spacing and heights into a harmonious typographic elixir for your design system.

1. **Invoke the Spell**  
   Begin your typographic journey by running the Typography Tokens Wizard script:

   ```sh
   npm run typo
   ```

2. **Choose Your Properties**  
   Select which typography properties you wish to configure:

   - Font Families
   - Font Sizes
   - Font Weights
   - Letter Spacing
   - Line Heights

3. **For Each Property:**

   **🔤 Font Family**

   - Name your property (fontFamily, font-family, fonts, ff, or custom)
   - Define 1-3 font families with fallbacks
   - Choose naming convention:
     - Semantic (primary, secondary, tertiary)
     - Purpose-based (title, body, details)
     - Ordinal (1, 2, 3)
     - Alphabetical (a, b, c)

   **📏 Font Size**

   - Name your property (fontSize, font-size, size, fs, or custom)
   - Select scale type:
     - 4-Point Grid
     - 8-Point Grid
     - Modular Scale
     - Custom Intervals
     - Fibonacci Scale
   - Choose unit (px, rem, em)
   - Define 1-12 sizes with naming convention:
     - T-shirt (xs, sm, md, lg, xl)
     - Incremental (10, 20, 30)
     - Ordinal (1, 2, 3)
     - Alphabetical (a, b, c...)

   **⚖️ Font Weight**

   - Name your property (fontWeight, font-weight, weight, fw, or custom)
   - Select from standard weights (100-900)
   - Choose naming convention:
     - T-shirt (xs to xl)
     - Semantic (thin to bold)
     - Ordinal (1 to 5)
     - Purpose-based (body, heading...)

   **↔️ Letter Spacing**

   - Name your property (letterSpacing, letter-spacing, tracking, ls, or custom)
   - Choose scale type:
     - Predetermined (-1.25 to 6.25)
     - Custom Intervals
   - Select unit (em, rem, px, %)
   - Define 1-7 values with naming convention:
     - T-shirt (xs to xl)
     - Incremental (100, 200...)
     - Ordinal (01, 02... or 1, 2...)
     - Alphabetical (a, b, c...)

   **↕️ Line Height**

   - Name your property (lineHeight, line-height, leading, lh, or custom)
   - Choose scale type:
     - Scale 1: 1.2, 1.35, 1.5, 1.65, 1.8
     - Scale 2: 1.25, 1.375, 1.5, 1.625, 1.75
     - Custom Intervals (with WCAG compliance check)
   - Select naming convention:
     - T-shirt (xs to xl)
     - Semantic (tight, normal, loose)
     - Ordinal (1 to 5)
     - Purpose-based (body, heading, display)

4. **Review & Confirm**  
   For each property, you'll see a preview table showing your configured values. Confirm or adjust as needed.

5. **Export Typography Tokens**  
   The tokens are exported in multiple formats, ready for integration into your design system:
   - **JSON:** Stored in `output_files/tokens/typography/typography_tokens.json`
   - **CSS:** Stored in `output_files/tokens/css/typography/typography_variables.css`
   - **SCSS:** Stored in `output_files/tokens/scss/typography/typography_variables.scss`

⚠️ **IMPORTANT:** Each step includes accessibility guidelines and recommendations to ensure your typography system is both beautiful and functional. The wizard acts as your trusted advisor, suggesting optimal values while giving you the freedom to customize according to your needs.

---

### 🧹 **Clear Spell** ✨

Version 1.2.0

The Clear Spell is a simple yet powerful tool to keep your project directory clean and organized. It removes all generated files, ensuring you can start fresh without any clutter.

1.  **Run the Clear Spell Script**  
    Open your terminal and execute the following command:

    ```sh
    npm run clear
    ```

2.  **What Happens Next**
    - All generated token files in the `output_files/tokens/` directory are deleted.
    - CSS and SCSS files in the `output_files/tokens/css/` and `output_files/tokens/scss/` directories are removed.
    - Final output files in the `output_files/final/` directory, including JSON, CSS, and SCSS files, will also be removed.
    - Your project directory is left clean, free from outdated or unnecessary files.

---

### 🪄 **Merge Spell** ✨

Version 1.2.0 🆙 🆙

The Merge Spell is designed to simplify your workflow by combining multiple token files into a single, unified file. This makes managing and integrating design tokens across categories (e.g., color, size, spacing) much easier.

1.  **Run the Merge Spell Script**  
    Open your terminal and execute the following command:

    ```sh
    npm run merge
    ```

2.  **What Happens Next**
    - All token files in the `output_files/tokens/` directory are merged into a single JSON, CSS and SCSS file.
    - The resulting file is structured consistently, ensuring seamless integration into your design system or development workflow.

---

## 🛠️ Dependencies ✨

Every wizard benefits from a little assistance. To empower our enchanting scripts, we rely on a handful of outstanding dependencies that streamline our process and amplify our magic:

For Color Conversion: This script uses the amazing TinyColor library to handle all the color conversions.

You can check out TinyColor's repository here:
https://github.com/bgrins/TinyColor

For Command Line Interface: This script uses the Inquirer library to create an interactive command line interface (CLI) for user conversations.

You can check out Inquirer's repository here:
https://github.com/SBoudrias/Inquirer.js

For CLI Styling: This script uses the Chalk library to add colors and styles to the command line interface (CLI), making it more visually appealing.

You can check out Chalk's repository here:
https://github.com/chalk/chalk

For enhanced command-line table formatting, this project leverages the "clitable-3" library. This dependency allows for dynamic and customizable table outputs when previewing tokens and other CLI interactions.

Check out the clitable-3 repository for further details and documentation:
https://github.com/your-org/clitable-3

For Color Manipulation: This script also utilizes the Color library, which provides a comprehensive set of tools for color manipulation and conversion, complementing TinyColor's capabilities.

You can check out the Color library's repository here:
https://github.com/Qix-/color

For File System Operations: This script employs the FS-extra library, which extends the native Node.js file system module with additional methods and functionality, making file operations more convenient.

You can check out FS-extra's repository here:
https://github.com/jprichardson/node-fs-extra

For Environment Variable Management: This script uses the Dotenv library to load environment variables from a .env file into process.env, allowing for better configuration management.

You can check out Dotenv's repository here:
https://github.com/motdotla/dotenv

---

## 📦 Dependencies ✨

Below is a comprehensive list of all dependencies used in this project:

| Dependency       | Version | Description                                                     | Repository                                                        |
| ---------------- | ------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| **chalk**        | ^5.4.1  | Terminal string styling done right                              | [chalk/chalk](https://github.com/chalk/chalk)                     |
| **cli-table3**   | ^0.6.5  | Pretty unicode tables for the command line                      | [cli-table3](https://github.com/cli-table/cli-table3)             |
| **inquirer**     | ^12.4.2 | A collection of common interactive command line user interfaces | [SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js) |
| **markdown-pdf** | ^11.0.0 | Markdown to PDF converter                                       | [alanshaw/markdown-pdf](https://github.com/alanshaw/markdown-pdf) |
| **path**         | ^0.12.7 | Node.js path module                                             | [nodejs/node](https://github.com/nodejs/node)                     |
| **tinycolor2**   | ^1.6.0  | Fast, small color manipulation and conversion                   | [bgrins/TinyColor](https://github.com/bgrins/TinyColor)           |

---

## 📝 License ✨

This project is licensed under the MIT License. This means you are free to use, modify, and distribute the software as long as the original copyright notice and permission notice are included in all copies or substantial portions of the software.

For more details, you can read the full license text in the [LICENSE](./LICENSE) file included in this repository or visit the Open Source Initiative for more information.

---

## Crafted with Love in Barcelona by Fulvia Buonanno 🪄❤️

If you're passionate about design systems and tokens, this tool is your perfect companion, enabling you to create tokens effortlessly. For fans of RPGs or JRPGs, this tool will evoke a sense of nostalgia, blending classic gaming vibes with your design workflow. 🧩

Created with love by Fulvia Buonanno, a Design Systems Designer based in Barcelona, this tool aims to bridge the gap between design and development, making Tokens Studio more accessible, especially for newcomers. 🧙

---
