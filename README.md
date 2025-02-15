# 🪄 **design-tokens-wizard** 🎨✨

Welcome to the enchanted world of **design-tokens-wizard**! 🦄 This mystical tool helps you effortlessly craft design tokens in multiple formats (HEX, RGB, RGBA, HSL) for your design system with just a few easy steps.

---

## 🧙‍♂️ **How to Use:**

### 1. **Install Dependencies**  
Run the spell:  
`npm install tinyColor`  
This installs the necessary package to handle color conversions.

### 2. **Run the Script**  
Cast the magic with:  
`node color-tokens-wizard.js`  
This will execute the script and start the process.

### 3. **Enter a HEX Color**  
When prompted, input your base HEX color (e.g., `#FABADA`). If you’re unsure about the format, feel free to check the example!

### 4. **Define Concept & Modifier**  
You’ll be asked to name your color’s **concept** (e.g., `brand`, `feedback`) and **modifier** (e.g., `primary`, `secondary`, `01`, `02`). This helps categorize your tokens.

### 5. **Choose Output Formats**  
Select which formats you’d like the tool to generate. You can get **HEX**, **RGB**, **RGBA**, and **HSL** formats, along with the default **HEX**.

### 6. **Add More Colors**  
Want more colors? Simply repeat steps 3-5 for each new color. The tool will update your **JSON files** accordingly, stored in the `tokens/` directory.

### 7. **Export Tokens**  
Once everything is defined, the script will generate **JSON files** with your tokens. These will be saved in the `tokens/` directory for easy integration.

### 8. **Generate CSS/SCSS Files**  
Finally, the tool will generate **CSS** and **SCSS** files with your design tokens as variables, ready for use in your development project. These will be saved in the `outputs/` directories.

---

## 🌟 **Features:**

- **Generate Color Stops:** Automatically creates 6 variations of your color (lightest, lighter, light, dark, darker, darkest).
  
- **Multiple Format Outputs:** The tool can output tokens in **HEX**, **RGB**, **RGBA**, and **HSL** formats to suit your project.

- **Tokens Studio Export:** Instantly export your design tokens in **JSON** format for easy integration with your design system.

- **Batch Processing:** Add multiple base colors in one go. The tool will process them all and generate tokens for each.

- **Custom Naming:** Define your own naming conventions for the tokens, based on your needs.

- **CSS & SCSS Files:** Automatically generate **CSS** and **SCSS** files with design tokens as variables.

---

## ✨ **Why Use This Script?**
- **Efficiency:** Save time by automating the generation of color variations and format conversions.
- **Seamless Integration:** Quickly integrate with Tokens Studio and other design systems.
- **Flexibility:** Tailor the tool’s workflow to fit your unique project requirements.

---

## 🛠️ **Dependencies:**
This enchanted script uses the powerful **[TinyColor](https://github.com/bgrins/TinyColor)** library for color conversions. Big thanks to **Brian Grinstead** for creating this magical tool!

---

With **design-tokens-wizard**, you’ll breeze through design token creation like a wizard mastering their craft. ✨🧙‍♂️ Let the magic begin!
