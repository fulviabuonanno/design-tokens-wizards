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

### 🚀 **Installation**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/design-tokens-wizards.git
   cd design-tokens-wizards
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

   This will install all required dependencies based on the exact versions specified in `package-lock.json`, ensuring consistency across all environments.

3. **Verify Installation**
   ```bash
   npm run color -- --version
   ```
   This should display the current version of the Color Wizard (2.3.0).

---

### ��️ **How to Use:**

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
    Stored in: `
