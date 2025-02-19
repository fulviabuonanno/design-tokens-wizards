# design-tokens-wizards 🪄🧙🎨 Version 1.1.

Hello, Design System aficionados! 🦄✨ Welcome to **`design-tokens-wizards`** — the enchanting scripts that helps you craft design tokens in just a few simple steps... as if by magic! 🪄✨

With **`design-tokens-wizard`**, you’ll unlock:

**+Efficiency:** Conjure up multiple formats for color, size, and spacing tokens automatically — no wand waving needed!  
**+Integration:** Effortlessly blend with Tokens Studio and other design systems, like a flawless unicorn-universe connection.  
**+Flexibility:** Customize your workflow with a sprinkle of pixie dust to fit your project’s unique needs.  
**+Ready-to-Test:** Focus on making decisions, not on how to structure your tokens. Let the magic handle the setup!  
**+Ready-to-CSS:** Have your tokens instantly converted into variables, ready for development’s testing phase.

Ready to let your creativity soar on the wings of a unicorn? 🦄✨ Let’s get started and cast some design magic together!

---

### 🛠️ **How to Use:**

1. **Install Node.JS**
To use the scripts, you need to have **Node.js** installed on your machine. You can download and install it from [Node.js official website](https://nodejs.org/).

2. **Run the Script**  
   ```markdown
   Select which wizard will come to your aid by executing script in your terminal. These are all the wizards you'll have available:

   | Token Group           | Script          | Command           | Description                                      | Versioning |
   |-----------------------|-----------------|-------------------|--------------------------------------------------|------------|
   | **COLOR WIZ**         | `color-wiz.js`  | `npm run color`   | Generate and manage color tokens                 | 1.2        |
   | **SIZE WIZ**          | `size_wiz.js`   | `npm run size`    | Generate and manage size tokens                  | 1.0        |
   | **SPACING WIZ**       | Coming Soon 🔜  | -                 | Generate and manage spacing tokens               | -          |
   | **TYPOGRAPHY WIZ**    | Coming Soon 🔜  | -                 | Generate and manage typography tokens            | -          |
   | **BORDER RADIUS WIZ** | Coming Soon 🔜  | -                 | Generate and manage border radius tokens         | -          |
   | **ACCESSIBILITY WIZ** | Coming Soon 🔜  | -                 | Validate color accessibility                     | -          |
   | **SHADOW WIZ**        | Coming Soon 🔜  | -                 | Generate and manage shadow tokens                | -          |
   | **JSON POT WIZ**      | Coming Soon 🔜  | -                 | Merge all your json token files in one single file | -          |
   ```
---

### 🎨 **Color Tokens Wizard** ✨

Color tokens can be complex, but with this wizard 🧙, you can simplify the process and save time. Start with a HEX value, and the wizard will convert it into RGB, RGBA, or HSL formats in just a few steps. The tokens are ready for use in the Tokens Studio plugin and also provide CSS/SCSS outputs for your developers.

1. **Run the Color Wiz Script**  
   Begin by running the Color Wiz script to start the process. Open your terminal and execute the following command:
   ```sh
   npm run color
   ```

2. **Select a Base Color**  
   Enter a HEX color code (e.g., `#FABADA`).

3. **Define Concept & Modifier**  
   Provide a name for the concept (e.g., `brand`, `background`). Optionally, choose a modifier:
   - **Variant**: (e.g., `primary`, `secondary`, `tertiary`)
   - **Scale**: (e.g., `incremental`, `alphabetical`, or `cardinal` scales)

4. **Generate Color Stops**  
   The script will automatically generate 6 color stops based on your base color:
   - `Lightest`, `Lighter`, `Light`, `Dark`, `Darker`, `Darkest`

5. **Choose Output Formats**  
   By default, your color will be saved in HEX format. You can also choose to generate additional formats:
   - **RGB**
   - **RGBA**
   - **HSL**

6. **Export Color Tokens**  
   The script will export your color tokens in Tokens Studio format, ready for integration into your design system. All JSON files will be prepared for import.

7. **Batch Processing**  
   You can process multiple base colors at once. Provide a list of colors, and the script will generate color tokens for each, creating separate JSON files for each.

8. **Generate CSS & SCSS Files**  
   The script will create CSS and SCSS files with color tokens as variables, saved in the following directories:
   - **CSS**: Stored in `outputs/css/color/color_variables.css`
   - **SCSS**: Stored in `outputs/scss/color/color_variables.scss`

9. **Add More Colors to the Same Group**  
   To add more colors to the existing group, repeat steps 1 and 2. The script will overwrite the existing JSON files in the `tokens/` directory based on your criteria.

---

### 📏 **Size Tokens Wizard** ✨

Managing size tokens can be a daunting task, but with the Size Tokens Wizard 🧙, you can streamline the process and save valuable time. Start with a base size, and the wizard will generate a range of size tokens in various units, ready for use in your design system and development projects.

1. **Run the Size Wiz Script**  
   Begin by running the Size Wiz script to start the process. Open your terminal and execute the following command:
   ```sh
   npm run size
   ```

2. **Define the Base Unit**  
   The default base unit for size tokens is pixels (px).

3. **Name Your Size Tokens**  
   Provide a name for your size tokens (e.g., size, spacing, dimension).

4. **Select a Scale**  
   Choose a predefined scale for your tokens:
   - **4px Grid**: Steps increase in increments of 4
   - **8-Point Grid**: Steps increase in increments of 8

5. **Define the Number of Values**  
   Specify how many size values you want to generate (e.g., 6 values for a small-to-large scale).

6. **Choose Naming Criteria**  
   Select a naming pattern for your size tokens:
   - **T-shirt Sizes**: (xs, sm, md, lg, xl)
   - **Incremental Numbers**: (100, 200, 300)
   - **Cardinal Numbers**: (1, 2, 3)
   - **Alphabetical**: (A, B, C or a, b, c)

7. **Generate Size Tokens**  
   The script will generate a list of size tokens based on the chosen scale and naming criteria.

8. **Convert to Other Units (Optional)**  
   By default, tokens are stored in pixels (px), but you can also convert them to:
   - **Points (pt)**
   - **Rem (rem)**
   - **Em (em)**

9. **Export Size Tokens**  
   The script exports your size tokens in Tokens Studio format as JSON files, making them ready for integration into your design system.

10. **Generate CSS & SCSS Files**  
    Automatically create CSS and SCSS files with your size tokens as variables:
    - **CSS**: Stored in `outputs/css/size/size_variables.css`
    - **SCSS**: Stored in `outputs/scss/size/size_variables.scss`


---


### 🛠️ **Dependencies** ✨

**For Color Conversion:**
This script uses the amazing **[TinyColor](https://github.com/bgrins/TinyColor)** library to handle all the color conversions. 

You can check out TinyColor's repository here:  
[https://github.com/bgrins/TinyColor](https://github.com/bgrins/TinyColor)

**For Command Line Interface:** 
This script uses the **[Inquirer](https://github.com/SBoudrias/Inquirer.js)** library to create an interactive command line interface (CLI) for user conversations. 

You can check out Inquirer's repository here:  
[https://github.com/SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js)

**For CLI Styling:**
This script uses the **[Chalk](https://github.com/chalk/chalk)** library to add colors and styles to the command line interface (CLI), making it more visually appealing.

You can check out Chalk's repository here:  
[https://github.com/chalk/chalk](https://github.com/chalk/chalk)

---

### 📝 **License** ✨

This project is licensed under the MIT License. This means you are free to use, modify, and distribute the software as long as the original copyright notice and permission notice are included in all copies or substantial portions of the software.

For more details, you can read the full license text in the `LICENSE` file included in this repository or visit the [Open Source Initiative](https://opensource.org/licenses/MIT) for more information.

---

### **Crafted with Love in Barcelona by Fulvia Buonanno 🪄❤️**

If you're passionate about design systems and tokens, this tool is your perfect companion, enabling you to create tokens effortlessly. For fans of RPGs or JRPGs, this tool will evoke a sense of nostalgia, blending classic gaming vibes with your design workflow. 🧩

Created with love by Fulvia Buonanno, a Design Systems Designer based in Barcelona, this tool aims to bridge the gap between design and development, making Tokens Studio more accessible, especially for newcomers. 🧙
