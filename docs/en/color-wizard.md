## 🎨 **Color Tokens Wizard**

<img src="src/assets/color_wiz.png" alt="Color Wizard" width="200">

![Color Wizard](https://img.shields.io/badge/Color%20Wiz-v2.11.1-yellow)

Conjure a dazzling palette for your design system with the Color Tokens Wizard 🧙! This magical script guides you through every step of crafting flexible, scalable color tokens—no spellbook required.

**Latest Update (v2.11.1):** ✨ Enhanced wizard UX with clearer step organization! The wizard flow now features improved visual hierarchy with consistent step numbering (STEP 1-4) and cleaner navigation throughout the color creation process.

**Previous Update (v2.11.0):** 🎨 Industry-standard preset configurations! Quick start with proven color scale formats from leading design systems (Tailwind CSS, Material Design 3, Chakra UI, Ant Design, and more). Choose from 15+ carefully curated presets or continue with full custom configuration. Plus enhanced batch mode with bulk entry and individual entry methods for adding multiple colors efficiently.

1. **Invoke the Wizard**  
   Cast the color spell in your terminal:

   ```sh
   npm run color
   ```

2. **STEP 1: TOKEN TYPE**
   Configure your token structure:

   **Choose Token Type:**
   - **Global Colors**
   - **Semantic Colors** (coming soon; currently redirects to Global)

   **Category Selection:** (Optional)
   Organize your tokens by category (e.g., primitives, foundation, core, basics, essentials, global, roots, or custom). Enter your own if you wish.

   **Naming Level:** (Optional)
   Add a naming level for extra clarity (e.g., color, colour, palette, scheme, or custom).

3. **STEP 2: SELECT COLOR** ✨
   Choose your color input method:

   **Single Color Mode:**
   - Enter a HEX color code (e.g., `#FABADA`)
   - Preview your magical hue
   - Give your color a unique name (e.g., `blue`, `yellow`, `red`)

   **Batch Mode:**
   Add multiple colors at once with the same scale settings.

   Choose your input method:
   - **Bulk Entry:** Paste multiple HEX codes at once
     - Separate codes with commas (`,`) or semicolons (`;`)
     - With or without `#` symbol (e.g., `#FF5733, 3498DB; 2ECC71`)
     - Name each color after entering all codes
   - **Individual Entry:** Add colors one at a time
     - Enter HEX code and name for each color
     - Choose to add more colors when ready

4. **STEP 3: CONFIGURE COLOR SCALE** 🎯
   Choose how to configure your color scale:

   **🎯 Use a Preset** (NEW in v2.11.0!)
   Quick start with industry-standard configurations:

   **Available Preset Categories:**

   - **🔥 Popular Frameworks** - Industry-standard design systems
     - Tailwind CSS (50-950, 10 stops)
     - Material Design (100-900, 9 stops)
     - Bootstrap (100-900, 9 stops)
     - Chakra UI (50-950, 10 stops)

   - **🧩 Component Libraries** - UI component library scales
     - Ant Design (1-10, ordinal)
     - Mantine UI (0-9, ordinal)
     - Radix Colors (01-12, padded ordinal)

   - **🏢 Enterprise Systems** - Enterprise design systems
     - IBM Carbon (10-100, 10 stops)
     - Adobe Spectrum (100-1400, 14 stops)

   - **🎨 Minimal Scales** - Simple, focused color scales
     - Five Shades (100-500, 5 stops)
     - Seven Shades (100-700, 7 stops)
     - Simple Semantic (dark, base, light)
     - Extended Semantic (10 semantic variations)

   - **📝 Other Formats** - Alternative naming schemes
     - Alphabetical A-J (10 stops)

   Each preset includes optimized mix ranges and stop counts tailored to that design system. Preview your selected preset with configuration details before confirming!

   **⚙️ Custom Configuration**
   Full control with custom settings:

   **Select Scale Type:**
   - **Incremental:** 100, 200, 300, 400
   - **Ordinal:** 01, 02, 03, 04 or 1, 2, 3, 4
   - **Alphabetical:** A, B, C, D or a, b, c, d
   - **Semantic Stops:** dark, base, light, etc.

   **Set Number of Stops:**
   Choose how many stops (shades) to generate (1–20, depending on scale type).

   **Customize Color Mix Range:** (Optional)
   Set the minimum and maximum mix percentages (default: 10%–90%) to control how your base color blends with white and black for the lightest and darkest stops.

5. **STEP 4: PREVIEW & CONFIRM**
    Review your color scale(s) in a table, complete with token names and HEX values.

    - For single colors: Full preview with all stops displayed
    - For batch mode: Preview of the first color with a summary of additional colors

    You can set the middle tone as the `base` if you wish. Confirm to proceed or restart to adjust.

6. **Expand Your Palette**
    Add more colors and repeat the process as many times as you like.

7. **Export and Convert**  
    When you're done, the wizard:

    - Exports tokens in Tokens Studio JSON format (HEX by default)
    - Offers to convert tokens to RGB, RGBA, HSL, and/or OKLCH
    - Generates CSS and SCSS files for each format
    - Cleans up unused files

    Your magical artifacts will appear in:

    - JSON: `output_files/tokens/json/color/color_tokens_{format}.json`
    - CSS: `output_files/tokens/css/color/color_variables_{format}.css`
    - SCSS: `output_files/tokens/scss/color/color_variables_{format}.scss`

8. **Review Your Spellwork**
    The wizard lists all updated, new, and deleted files for your review.

---

**Note:**

- Semantic color support is planned but not yet available.
- All steps allow for custom input and confirmation before proceeding.
- The wizard ensures no duplicate color names in your chosen structure.
- You can always restart a step to adjust your input.

---
