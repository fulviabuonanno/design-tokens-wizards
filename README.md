# design-tokens-wizards 🪄🧙🎨

Hello, Design System aficionados! 🦄✨ Welcome to **`design-tokens-wizards`** — the enchanting scripts that helps you craft design tokens in just a few simple steps... as if by magic! 🪄✨

With **`design-tokens-wizards`**, you’ll unlock:

- **Enforce Naming Conventions:** Harness the power of our Design System lexicon to imbue each token with a spellbinding, standardized identity.
- **Efficiency:** Conjure up multiple formats for color, size, and spacing tokens automatically — no wand waving needed!
- **Integration:** Effortlessly blend with Tokens Studio and other design systems, like a flawless unicorn-universe connection.
- **Flexibility:** Customize your workflow with a sprinkle of pixie dust to fit your project’s unique needs.
- **Ready-to-Test:** Focus on making decisions, not on how to structure your tokens. Let the magic handle the setup!
- **Ready-to-CSS/SCSS:** Have your tokens instantly converted into variables, ready for development’s testing phase.

Ready to let your creativity soar on the wings of a unicorn? 🦄✨ Let’s get started and cast some design magic together!

---

### 🛠️ **How to Use:**

1. **Install Node.JS**
   To use the scripts, you need to have **Node.js** installed on your machine. You can download and install it from [Node.js official website](https://nodejs.org/).

2. **Run the Script**

Select the wizard that will come to your aid by executing the corresponding script in your terminal. Below is a list of available wizards:

| Token Wizard             | Script Name    | Run Command     | Description                              | Version |
| ------------------------ | -------------- | --------------- | ---------------------------------------- | ------- |
| 🟡 **COLOR WIZ**         | `color-wiz.js` | `npm run color` | Generate and manage color tokens         | 2.2.0  |
| 🔵 **SIZE WIZ**          | `size_wiz.js`  | `npm run size`  | Generate and manage size tokens          | 1.4.0   |
| 🟣 **SPACE WIZ**         | `space_wiz.js` | `npm run space` | Generate and manage spacing tokens       | 1.4.0   |
| 🟢 **BORDER RADIUS WIZ** | `radii_wiz.js` | `npm run radii` | Generate and manage border radius tokens | 1.4.0   |
| **SHADOW WIZ**           | Coming Soon    | –               | Generate and manage shadow tokens        | –       |
| **OPACITY WIZ**          | Coming Soon    | –               | Generate and manage opacity tokens       | –       |
| **TYPOGRAPHY WIZ**       | Coming Soon    | –               | Generate and manage typography tokens    | –       |

Below is a curated collection of spells (crafted by our Token's Wizards to come to your aid) to streamline your design tokens workflow:

| Spell                   | Script Name      | Run Command     | Description                                              | Version |
| ----------------------- | ---------------- | --------------- | -------------------------------------------------------- | ------- |
| **MERGE SPELL**         | Coming Soon      | –               | Combine all token files into a single unified file       | –       |
| **CLEAR SPELL**         | `clear_spell.js` | `npm run clear` | Remove all generated output files in one swift command   | 1.0.0   |
| **ACCESSIBILITY SPELL** | Coming Soon      | –               | Assess and ensure the accessibility of your color tokens | –       |

---

### 🎨 **Color Tokens Wizard** ✨

Version 2.2.0.

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
   *Example: `blue`, `yellow`, or `red`.*

   **Note:** This wizard currently supports the creation of **global colors** only.

4. **Select and Customize the Scale**  
   Choose the scale type that best suits your magical needs:
   
   - **Incremental:** Generate stops using an incremental step (e.g., 10, 50, or 100).  
   - **Ordinal:** Create a sequence (e.g., 01, 02, 03… or 1, 2, 3…).  
   - **Shades Semantic:** Generate semantic stops with labels like `ultra-dark`, `darkest`, `darker`, `dark`, `semi-dark`, `base`, `semi-light`, `light`, `lighter`, `lightest`, and `ultra-light`.

5. **Behold the Preview**  
   The wizard will cast a preview spell showing your color’s preview along with the stops table. You’ll see something like:

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
      Stored in: `outputs/tokens/color` as `color_tokens_{format}.json`
   - Conjure CSS and SCSS files with your tokens as variables.
      Stored in `outputs/css/color/` and `outputs/scss/color/` respectively as: `color_variables_{format}.css` and `color_variables_{format}.scss`

8. **Expand Your Palette**  
   Should your creative spirit desire more color magic, simply add “more colors to the same group” and repeat the process. The wizard is always ready to extend your enchanted palette.

9. **Finalize the Spell**  
   Review the output files (listed as updated, saved, or deleted) and relish the magic you’ve created. Your design tokens are now fully prepared for integration into your design system.

---

**Note:** Additional semantic color capabilities are on the way to elevate your design magic even further!

Let the art of token crafting infuse your project with endless creativity—and may your colors forever dazzle!

---

### 📏 **Size Tokens Wizard** ✨

Version 1.4.0

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
   Stored in: `outputs/tokens/size/size_tokens_{unit}.json`

11. **Generate CSS & SCSS Files**  
    Automatically create CSS and SCSS files with your size tokens as variables:
    - **CSS**: Stored in `outputs/css/size/size_variables_{unit}.css`
    - **SCSS**: Stored in `outputs/scss/size/size_variables_{unit}.scss`


---

### 🔳 **Space Tokens Wizard** ✨

Version 1.4.0

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
   Stored in: `outputs/tokens/space/space_tokens*{unit}.json`

11. **Generate CSS & SCSS Files**  
    Automatically create CSS and SCSS files with your space tokens as variables:
    - **CSS**: Stored in `outputs/css/space/space_variables_{unit}.css`
    - **SCSS**: Stored in `outputs/scss/space/space_variables_{unit}.scss`

---

### ⭕️ **Border Radius Tokens Wizard** ✨

Version 1.4.0

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
   Stored in: `outputs/tokens/border-radius/border_radius_tokens*{unit}.json`

11. **Generate CSS & SCSS Files**  
   Automatically create CSS and SCSS files with your border-radius tokens as variables:
   - **CSS:** Stored in `outputs/css/border-radius/border_radius_variables_{unit}.css`
   - **SCSS:** Stored in `outputs/scss/border-radius/border_radius_variables_{unit}.scss`

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

---


## 📝 License ✨
This project is licensed under the MIT License. This means you are free to use, modify, and distribute the software as long as the original copyright notice and permission notice are included in all copies or substantial portions of the software.

For more details, you can read the full license text in the [LICENSE](./LICENSE) file included in this repository or visit the Open Source Initiative for more information.

---

## Crafted with Love in Barcelona by Fulvia Buonanno 🪄❤️

If you're passionate about design systems and tokens, this tool is your perfect companion, enabling you to create tokens effortlessly. For fans of RPGs or JRPGs, this tool will evoke a sense of nostalgia, blending classic gaming vibes with your design workflow. 🧩

Created with love by Fulvia Buonanno, a Design Systems Designer based in Barcelona, this tool aims to bridge the gap between design and development, making Tokens Studio more accessible, especially for newcomers. 🧙 
