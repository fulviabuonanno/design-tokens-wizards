# color-tokens-crafter 🎨

Hello, Design System aficionados! 👋 Welcome to **color-tokens-crafter** — a script that helps you **craft color tokens** in just a few simple steps. Whether you're working with HEX, RGB, RGBA, or HSL formats, this tool streamlines the process, saving you time and effort. Let's dive in!

### 🚀 **Features:**

1. **Select a Base Color**  
   Start by entering a base color, typically in **HEX format** (e.g., `#FABADA`).

2. **Generate Color Stops**  
   Automatically generate **6 color stops** (lightest, lighter, light, dark, darker, darkest) based on your base color. Say goodbye to manually calculating these variations!

3. **Multiple Format Outputs**  
   By default, your color is saved in **HEX** format, but you can also generate files in **RGB, RGBA, and HSL** formats. Choose what fits your needs!

4. **Tokens Studio Export**  
   The script exports your color tokens in **Tokens Studio format** for easy integration with your design system. Get your **JSON files** ready for import!

---

### 🛠️ **How to Use:**

1. **Run the Script**  
   Simply execute the script in your terminal.

2. **Enter a HEX Color**  
   When prompted, input your base HEX color. If you're unsure about the format, feel free to check the example.

3. **Define Concept & Variant**  
   You'll be asked to provide a name for the **concept** (e.g., `primary`, `ui-background`, etc.) and an optional **variant** (e.g., `light`, `dark`). Press **Enter** to skip if not needed.

4. **Choose Output Formats**  
   Decide whether you want to generate **RGB**, **RGBA**, or **HSL** formats alongside the default HEX. Press **Enter** to skip any formats you don't need.

5. **Export the Tokens**  
   Once the color and formats are defined, the script will create **JSON files** in the `formats/` and `tokens/` directories.

---

### ⚠️ **Important Limitation:**

- Currently, the script **only supports the creation of one color at a time**. If you need to create tokens for multiple colors, you'll need to manually index them in the generated **Tokens Studio JSON** file. 

---

### 🔜 **Next Features Coming Soon:**

- Add more base colors and generate token sets for entire palettes.
- Customize naming conventions and structures for tokens.
- Control the number of color stops to suit your design system's needs.
- Incorporate **color accessibility** checks to ensure your colors are accessible to all users.

---

### 💡 **Why Use This Script?**

- **Efficiency:** Automatically generate multiple formats and color variations without manual effort.
- **Integration:** Seamlessly integrate with Tokens Studio and other design systems.
- **Flexibility:** Customize your workflow to fit your project requirements.

---

### 🧑‍💻 **Getting Started:**

1. Clone or download this repository.
2. Install dependencies via `npm install`.
3. Run the script with `node color-tokens-craft.js`.
4. Follow the prompts and let the script do the heavy lifting for you!

---

### 🛠️ **Powered by TinyColor** ✨

This script uses the amazing **[TinyColor](https://github.com/bgrins/TinyColor)** library to handle all the color conversions. Huge thanks to **Brian Grinstead** for this fantastic tool!

You can check out TinyColor's repository here:  
[https://github.com/bgrins/TinyColor](https://github.com/bgrins/TinyColor)
