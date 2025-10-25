## 🎨 **Color Tokens Wizard**

<img src="src/assets/color_wiz.png" alt="Color Wizard" width="200">

![Color Wizard](https://img.shields.io/badge/Color%20Wiz-v2.11.0-yellow)

Conjure a dazzling palette for your design system with the Color Tokens Wizard 🧙! This magical script guides you through every step of crafting flexible, scalable color tokens—no spellbook required.

**Latest Update (v2.11.0):** 🎨 Enhanced batch mode feature! You can now add multiple colors at once using two convenient methods:

- **Bulk Entry:** Paste multiple HEX codes separated by commas or semicolons (e.g., `#FF5733, 3498DB; 2ECC71`)
- **Individual Entry:** Add colors one at a time with immediate feedback
  All colors in a batch share the same scale configuration, dramatically speeding up the creation of comprehensive color palettes.

**Previous Update (v2.9.1):** Fixed middle tone selection logic - when selecting a middle tone as 'base', the original hex color is now correctly assigned to the middle tone (e.g., "500") and 'base' is removed from the output, eliminating duplicate values.

1. **Invoke the Wizard**  
   Cast the color spell in your terminal:

   ```sh
   npm run color
   ```

2. **Choose Token Type**  
   Select your color token foundation:

   - **Global Colors**
   - **Semantic Colors** (coming soon; currently redirects to Global)

3. **Set Category**  
   (Optional) Organize your tokens by category (e.g., primitives, foundation, core, basics, essentials, global, roots, or custom). Enter your own if you wish.

4. **Set Naming Level**
   (Optional) Add a naming level for extra clarity (e.g., color, colour, palette, scheme, or custom).

5. **Choose Color Mode** ✨
   Select how you want to add colors:

   - **Single Color:** Add one color at a time (traditional workflow)
   - **Batch Mode:** Add multiple colors at once with the same scale settings

6. **Add Your Colors**
   Depending on your mode choice:

   **Single Color Mode:**

   - Enter a HEX color code (e.g., `#FABADA`)
   - Preview your magical hue
   - Give your color a unique name (e.g., `blue`, `yellow`, `red`)

   **Batch Mode** (NEW in v2.11.0!):

   Choose your input method:

   - **Bulk Entry:** Paste multiple HEX codes at once
     - Separate codes with commas (`,`) or semicolons (`;`)
     - With or without `#` symbol (e.g., `#FF5733, 3498DB; 2ECC71` or `FF5733,3498DB,2ECC71`)
     - Name each color after entering all codes
   - **Individual Entry:** Add colors one at a time
     - Enter HEX code and name for each color
     - Choose to add more colors when ready

   All colors in batch mode will share the same scale configuration, dramatically speeding up palette creation!

7. **Select Scale Type**
   Decide how your color stops will be generated:

   - **Incremental:** 100, 200, 300, 400
   - **Ordinal:** 01, 02, 03, 04 or 1, 2, 3, 4
   - **Alphabetical:** A, B, C, D or a, b, c, d
   - **Semantic Stops:** dark, base, light, etc.

8. **Set Number of Stops**
   Choose how many stops (shades) to generate (1–20, depending on scale type).

9. **Customize Color Mix Range**
   (Optional) Set the minimum and maximum mix percentages (default: 10%–90%) to control how your base color blends with white and black for the lightest and darkest stops.

10. **Preview and Confirm**
    Review your color scale(s) in a table, complete with token names and HEX values.

    - For single colors: Full preview with all stops displayed
    - For batch mode: Preview of the first color with a summary of additional colors
      You can set the middle tone as the `base` if you wish. Confirm to proceed or restart to adjust.

11. **Expand Your Palette**
    Add more colors and repeat the process as many times as you like.

12. **Export and Convert**  
    When you're done, the wizard:

    - Exports tokens in Tokens Studio JSON format (HEX by default)
    - Offers to convert tokens to RGB, RGBA, HSL, and/or OKLCH
    - Generates CSS and SCSS files for each format
    - Cleans up unused files

    Your magical artifacts will appear in:

    - JSON: `output_files/tokens/json/color/color_tokens_{format}.json`
    - CSS: `output_files/tokens/css/color/color_variables_{format}.css`
    - SCSS: `output_files/tokens/scss/color/color_variables_{format}.scss`

13. **Review Your Spellwork**  
    The wizard lists all updated, new, and deleted files for your review.

---

**Note:**

- Semantic color support is planned but not yet available.
- All steps allow for custom input and confirmation before proceeding.
- The wizard ensures no duplicate color names in your chosen structure.
- You can always restart a step to adjust your input.

---
