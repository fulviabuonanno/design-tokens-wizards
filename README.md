# color-tokens-wizard 🪄🧙🎨

Hello, Design System aficionados! 👋 Welcome to **color-tokens-wizard** — a script that helps you **craft color tokens** in just a few simple steps... Just like magic!
Whether you're working with HEX, RGB, RGBA, or HSL formats, this tool streamlines the process, saving you time and effort. Let's dive in and ride this unicorn! 🦄

### 🚀 **Features: Version 1.1.**

1. **Select a Base Color**  
   Start by entering a base color, typically in **HEX format** (e.g., `#FABADA`).

2. **Generate Color Stops**  
   Automatically generate **6 color stops** (lightest, lighter, light, dark, darker, darkest) based on your base color. Say goodbye to manually calculating these variations!

3. **Multiple Format Outputs**  
   By default, your color is saved in **HEX** format, but you can also generate files in **RGB, RGBA, and HSL** formats. Choose what fits your needs!

4. **Tokens Studio Export**  
   The script exports your color tokens in **Tokens Studio format** for easy integration with your design system. Get your **JSON files** ready for import!

5. **Batch Processing**  
   Now you can process multiple base colors in one go. Simply provide a list of colors, and the script will generate tokens for each one.

6. **Customizable Naming Conventions**  
   Define your own naming conventions and structures for tokens to better fit your design system.

7. **CSS & SCSS files with color tokens as variables**  
   Have your tokens converted and ready to be used in your dev project.

---

### 🛠️ **How to Use:**

1. **Install Dependencies**
   To install the package, run `npm install tinyColor` in your terminal.

2. **Run the Script**  
   Simply execute the script in your terminal via `node color-tokens-wizard.js`.

3. **Enter a HEX Color**  
   When prompted, input your base HEX color. If you're unsure about the format, feel free to check the example.

4. **Define Concept & Modifier**  
   You'll be asked to provide a name for the (case A) **concept** (e.g., `brand`, `feedback`, etc.) and/or (case B) the modifier: **variant** (e.g., `primary`, `secondary`, `tertiary`) and/or **scale** (e.g., `01, 02, 03` etc.)

5. **Choose Output Formats**  
   Decide whether you want to generate **RGB**, **RGBA**, or **HSL** formats alongside the default **HEX** file.

6. **Adding More Colors**  
   If user wants to add more colors to it's selection, then it's possible by repeating steps 3 and 4 and then, by the choosen criteria, the **JSON FIles** will overwrite in the `tokens/` directories.

7. **Export the Tokens**  
   Once the color naming and formats are defined, the script will create all the **JSON files** in the `outputs/tokens/` directory.

8. **Generaion of CSS/SCCS files**  
   Once everything is ready the script will create all the **JSON files** in the `outputs/css/` and `outputs/scss/` directories.

---

### 💡 **Why Use This Script?**

- **Efficiency:** Automatically generate multiple formats and color variations without manual effort.
- **Integration:** Seamlessly integrate with Tokens Studio and other design systems.
- **Flexibility:** Customize your workflow to fit your project requirements.

---

### 🛠️ **Dependencies** ✨

This script uses the amazing **[TinyColor](https://github.com/bgrins/TinyColor)** library to handle all the color conversions. Huge thanks to **Brian Grinstead** for this fantastic tool!

You can check out TinyColor's repository here:  
[https://github.com/bgrins/TinyColor](https://github.com/bgrins/TinyColor)

This script uses the amazing **[TinyColor](https://github.com/bgrins/TinyColor)** library to handle all the color conversions. Huge thanks to **Brian Grinstead** for this fantastic tool!

You can check out TinyColor's repository here:  
[https://github.com/bgrins/TinyColor](https://github.com/bgrins/TinyColor)
